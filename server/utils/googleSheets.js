const axios = require('axios');

// Env lazily read hota hai, taaki module load order se behaviour na badle.
// Apps Script cold start me 15-25s lag sakte hain, isliye read timeout
// generous rakha gaya hai. Override karne ke liye SHEET_READ_TIMEOUT set karo.
const appsScriptUrl = () => process.env.APPS_SCRIPT_URL;
// Agar sheet wala Apps Script token maangta hai to Render me ye env bharo.
// Optional hai — jisme token nahi wo script ise ignore kar deta hai.
const appsScriptToken = () => String(process.env.APPS_SCRIPT_TOKEN || '').trim();
const readTimeout = () => Number(process.env.SHEET_READ_TIMEOUT || 30000);
const writeTimeout = () => Number(process.env.SHEET_WRITE_TIMEOUT || 30000);

class SheetError extends Error {
  constructor(message, cause, { status = 502, expose = false, retryable = false } = {}) {
    super(message);
    this.name = 'SheetError';
    this.status = status;
    // expose=true = message user tak dikhao. Ye sirf un errors ke liye hai
    // jiska fix operator khud kar sakta hai (jaise sheet tab na hona).
    this.expose = expose;
    // retryable = ye ek aisi failure hai jo cold start / quota spike ki wajah
    // se ho sakti hai, isliye withRetry ise dobara try kare. Pehle ye
    // message-text se pakda jaata tha, jisse DNS/network errors (jo asli me
    // retryable hote hain) kabhi retry nahi hote the.
    this.retryable = retryable;
    this.cause = cause;
  }
}

const isRetryable = (error) => error instanceof SheetError && error.retryable;

/**
 * `Unauthorized` aane par URL par ek GET kar ke pata chalta hai ki wo kis
 * script ka hai. Mail/file script ka URL galti se `APPS_SCRIPT_URL` me chala
 * jaata hai aur tab tak poora portal down rehta hai — isliye error me hi
 * script ka naam aa jaye to operator ko dhundhna nahi padta.
 */
const identified = new Map();

const identifyScript = async (target) => {
  const cached = identified.get(target);
  if (cached && Date.now() - cached.ts < 60 * 1000) return cached.service;

  try {
    const { data } = await axios.get(target, { timeout: 10000, responseType: 'text' });
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const service = parsed && parsed.service ? String(parsed.service).slice(0, 80) : '';
    identified.set(target, { service, ts: Date.now() });
    return service;
  } catch {
    return '';
  }
};

/**
 * Error ka chhota, saaf tukda — browser tak bhejne ke liye.
 * Do cheezein hataani hain: (1) HTML tags, (2) koi bhi URL — Apps Script ka
 * URL browser kabhi nahi milna chahiye (wo poora datastore ka darwaza hai).
 */
const publicDetail = (value, max = 200) =>
  String(value || '')
    .replace(/https?:\/\/\S+/gi, '[link]')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

// Network-level failures jinme Google ka jawab hi nahi mila (DNS, connection
// refused/reset). Ye waqai retry se theek ho sakti hain — Render ke free plan
// par aisi cheezein ek baar me aam hain.
const NETWORK_CODES = new Set([
  'ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'EHOSTUNREACH',
  'ENETUNREACH', 'ETIMEDOUT', 'EPIPE', 'ERR_SOCKET_CONNECTION_TIMEOUT',
  'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT'
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Idempotent read par bounded retry with backoff.
 * Apps Script free quota me shared spike common hai, isliye 2 extra
 * attempts lena reliability bahut badhata hai aur duplicate likhta nahi.
 */
const withRetry = async (fn, { attempts, baseDelay }) => {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || i === attempts - 1) throw error;
      // jitter taaki saare clients ek saath retry na karein
      const wait = baseDelay * 2 ** i + Math.floor(Math.random() * 400);
      await sleep(wait);
    }
  }
  throw lastError;
};

const post = async (payload, timeout) => {
  const url = appsScriptUrl();
  if (!url) {
    throw new SheetError(
      'School data service is not configured (APPS_SCRIPT_URL is missing on the server).',
      null,
      { status: 503, expose: true }
    );
  }

  let response;
  try {
    // Token body me bhejte hain — Apps Script `e.parameter` / parsed body se
    // ise padh leta hai, alag header ki zaroorat nahi padti.
    const token = appsScriptToken();
    const body = token ? { ...payload, token } : payload;
    response = await axios.post(url, body, { timeout });
  } catch (error) {
    if (error.response) {
      const httpStatus = Number(error.response.status) || 0;
      const body = publicDetail(error.response.data, 140);
      // 429/5xx = Google ka server ya quota ka jhatka, apne aap theek ho
      // sakta hai. 401/403/404 = deployment galat hai, retry ka koi fayda nahi.
      const transient = [408, 429, 500, 502, 503, 504].includes(httpStatus);
      throw new SheetError(
        `Storage service rejected the request (HTTP ${httpStatus}${body ? `: ${body}` : ''})`,
        error,
        { status: 503, expose: true, retryable: transient }
      );
    }

    if (error.code === 'ECONNABORTED') {
      throw new SheetError('Storage service timed out. Please try again.', error, {
        status: 504,
        expose: true,
        retryable: true
      });
    }

    const code = String(error.code || '');
    const detail = publicDetail(`${code ? `${code}: ` : ''}${error.message || error.name}`, 140);

    // Env var me galti (trailing space, tuta hua URL) — retry se kuch nahi
    // hoga, aur user ko saaf batana zaroori hai warna wo bas retry karta rahega.
    if (code === 'ERR_INVALID_URL' || /invalid url/i.test(error.message || '')) {
      throw new SheetError(
        'APPS_SCRIPT_URL on the server is not a valid URL. Fix it and redeploy.',
        error,
        { status: 503, expose: true }
      );
    }

    // DNS/connection failure = network ka ek waqt ka jhatka, retryable.
    throw new SheetError(
      `Could not reach the storage service (${detail}). Please try again in a moment.`,
      error,
      { status: 503, expose: true, retryable: NETWORK_CODES.has(code) }
    );
  }

  let data = response.data;

  // Apps Script kabhi JSON ko `text/plain` me bhej deta hai — pehle parse kar
  // lo, taaki uska `error` baad ka check miss na ho.
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      // parse fail = asli me HTML/text aaya hai, neeche handle hoga
    }
  }

  // HTML (sign-in / redirect page) aane par pehle ye chup-chaap "khali sheet"
  // ban jaata tha, jisse har login par galat "Incorrect email or password"
  // dikhta tha aur asli wajah kabhi pata hi nahi chalti thi.
  if (typeof data === 'string') {
    const looksLikePage = /<\s*(!doctype|html)\b/i.test(data);
    throw new SheetError(
      looksLikePage
        ? 'The storage service sent a web page instead of data. The Apps Script deployment access must be set to "Anyone" (Deploy → Manage deployments → edit).'
        : `The storage service sent an unexpected answer (${publicDetail(data, 120)})`,
      null,
      { status: 503, expose: true }
    );
  }

  if (data && typeof data === 'object' && data.error) {
    const raw = String(data.error);

    // Script "Unauthorized" tab bolta hai jab uska token match na ho — ya jab
    // APPS_SCRIPT_URL galat script (mail/file wala) ko point kar raha ho. Ye
    // env fix karne wali baat hai, code se theek nahi hoti, isliye poori
    // wajah browser tak jaani chahiye — warna sirf "Something went wrong"
    // dikhta tha aur login hamesha fail rehta tha.
    if (/^\s*unauthorized\s*$/i.test(raw)) {
      const service = await identifyScript(url);
      throw new SheetError(
        service
          ? `APPS_SCRIPT_URL is pointing at the "${service}" script, not the school sheet. Replace that env value with the sheet script's /exec URL and redeploy.`
          : 'APPS_SCRIPT_URL answered "Unauthorized" — either that URL belongs to a different Apps Script (mail/file), or this sheet script now requires a token. Point APPS_SCRIPT_URL at the sheet script\'s /exec URL and set APPS_SCRIPT_TOKEN if that script checks one, then redeploy.',
        null,
        { status: 503, expose: true }
      );
    }

    // "Sheet not found: X" — ye code ki galti nahi, spreadsheet me wo tab hi
    // nahi bana. Bina iske user ko sirf "Something went wrong" dikhta tha aur
    // wo kabhi samajh nahi pata ki Forms/FormSubmissions tab banana padta hai.
    const missing = /^Sheet not found:\s*(.+)$/.exec(raw);
    if (missing) {
      const tab = missing[1].trim();
      throw new SheetError(
        `The "${tab}" tab is missing in the school spreadsheet. Open the spreadsheet, add a tab named exactly "${tab}" with a header row in the first line, then try again.`,
        null,
        { status: 503, expose: true }
      );
    }

    throw new SheetError(`Storage service said: ${publicDetail(raw, 160)}`, null, {
      status: 503,
      expose: true
    });
  }

  return data;
};

const extractRows = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.values)) return data.values;
  if (data && Array.isArray(data.rows)) return data.rows;
  return [];
};

// Apps Script reads hamesha network hota hai (cold start slow). Ek hi second
// me multiple requests Users/Attendance baar-baar fetch karte hain (dashboard,
// roster, markAttendance keya keya). Ek chhota TTL cache rakha hai — har
// write (append/update/delete) par peeche ka cache turant khaali ho jata hai,
// isliye data kabhi bekar purana nahi rehta. Cache jo data deta hai wo uth
// hi vaise ka vaise hota hai jaisa aaj tak tha — sirf lag kam hota hai.
const cacheTTL = () => Number(process.env.SHEET_CACHE_TTL_MS || 8000);

// Stale-while-revalidate ki limit. TTL ke baad bhi data turant de diya jata
// hai (thoda purana), aur peeche me fresh khaana laaya jata hai. Isse user
// ko Apps Script ka network wait har request me nahi dikhta — dashboard ka
// dobara kholna turant hota hai. Har write cache turant khaali karta hai,
// isliye delete/update ke baad purana data serve nahi hota.
const swrTTL = () => Number(process.env.SHEET_CACHE_SWR_MS || 45000);

const cache = new Map();    // sheetName -> { ts, data }
const inflight = new Map(); // sheetName -> Promise (ek chal raha hai to baaki usi ka wait karte hain)

// Har sheet ka apna version. Ek write version badha deta hai, aur jo read us
// write se pehle shuru hui thi wo apna purana jawab cache me nahi likhti.
// Warna ye hota tha: write → cache khaali → usi waqt chal rahi purani read
// apna (purana) data cache me daal deti thi, aur naye student ko login karne
// par "Incorrect email or password" aata tha jab tak TTL khatam na ho.
const versions = new Map();

const sheetVersion = (sheetName) => versions.get(sheetName) || 0;

const bustSheetCache = (sheetName) => {
  versions.set(sheetName, sheetVersion(sheetName) + 1);
  cache.delete(sheetName);
  // Chal raha hua read bhi bekaar ho sakta hai (purana data le kar aayega) —
  // isliye use bhi chhod dete hain taaki naya request fresh read kare.
  inflight.delete(sheetName);
};

const readSheet = async (sheetName) => {
  const startedAt = sheetVersion(sheetName);
  const attempts = Number(process.env.SHEET_READ_ATTEMPTS || 3);
  const data = await withRetry(
    () => post({ action: 'read', sheetName }, readTimeout()),
    { attempts, baseDelay: 700 }
  );
  const rows = extractRows(data);
  // Beech me koi write hua ho to is jawab ko cache mat banao.
  if (sheetVersion(sheetName) === startedAt) {
    cache.set(sheetName, { ts: Date.now(), data: rows });
  }
  return rows;
};

async function getSheetData(sheetName) {
  const hit = cache.get(sheetName);
  const age = hit ? Date.now() - hit.ts : Infinity;

  if (hit && age < cacheTTL()) return hit.data;

  // Yehi sheet ka read already chal raha hai to usi ka intezaar karo.
  // Pehle N parallel requests (dashboard + roster + attendance ek saath) me
  // se har ek alag Apps Script call bhejta tha, to ek hi data ke liye 5-6
  // network round-trips lag jaate the. Ab sirf ek jayegi.
  const pending = inflight.get(sheetName);
  if (pending) return pending;

  // Thoda purana data hai par itna purana nahi ki user ko farak na dikhe —
  // abhi turant de do, aur fresh khaana background me laa lo.
  if (hit && age < swrTTL()) {
    const fresh = readSheet(sheetName).finally(() => inflight.delete(sheetName));
    inflight.set(sheetName, fresh);
    // Background failure user ko nahi dikhani chahiye (purana data chalta rahe).
    fresh.catch(() => {});
    return hit.data;
  }

  const fresh = readSheet(sheetName).finally(() => inflight.delete(sheetName));
  inflight.set(sheetName, fresh);
  return fresh;
}

async function appendSheetData(sheetName, values) {
  await post({ action: 'append', sheetName, values }, writeTimeout());
  bustSheetCache(sheetName);
  return true;
}

async function updateSheetData(sheetName, id, values) {
  await post({ action: 'update', sheetName, id, values }, writeTimeout());
  bustSheetCache(sheetName);
  return true;
}

async function deleteSheetData(sheetName, id) {
  await post({ action: 'delete', sheetName, id }, writeTimeout());
  bustSheetCache(sheetName);
  return true;
}

const storageConfigured = () => Boolean(appsScriptUrl());

module.exports = {
  getSheetData,
  appendSheetData,
  updateSheetData,
  deleteSheetData,
  bustSheetCache,
  storageConfigured,
  SheetError
};
