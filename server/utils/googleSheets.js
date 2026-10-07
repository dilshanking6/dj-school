const axios = require('axios');

// Env lazily read hota hai, taaki module load order se behaviour na badle.
// Apps Script cold start me 15-25s lag sakte hain, isliye read timeout
// generous rakha gaya hai. Override karne ke liye SHEET_READ_TIMEOUT set karo.
const appsScriptUrl = () => process.env.APPS_SCRIPT_URL;
const readTimeout = () => Number(process.env.SHEET_READ_TIMEOUT || 30000);
const writeTimeout = () => Number(process.env.SHEET_WRITE_TIMEOUT || 30000);

class SheetError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'SheetError';
    this.status = 502;
    this.cause = cause;
  }
}

// Apps Script cold start aur shared-quota spikes par read fail hota hai.
// Ye wo errors hain jo retry se theek ho sakte hain (timeout / unreachable /
// quota-ki reject). Ek baar reject = seedha error nahi, retry karo.
const RETRYABLE = [
  'Storage service timed out. Please try again.',
  'Storage service is unreachable',
  'Storage service rejected the request'
];
const isRetryable = (error) =>
  error instanceof SheetError && RETRYABLE.includes(error.message);

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
    throw new SheetError('Storage service is not configured. Add APPS_SCRIPT_URL to the server environment.');
  }

  let response;
  try {
    response = await axios.post(url, payload, { timeout });
  } catch (error) {
    if (error.response) {
      throw new SheetError('Storage service rejected the request', error);
    }
    if (error.code === 'ECONNABORTED') {
      throw new SheetError('Storage service timed out. Please try again.', error);
    }
    throw new SheetError('Storage service is unreachable', error);
  }

  if (response.data && response.data.error) {
    throw new SheetError(String(response.data.error), null);
  }

  return response.data;
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

const bustSheetCache = (sheetName) => {
  cache.delete(sheetName);
  // Chal raha hua read bhi bekaar ho sakta hai (purana data le kar aayega) —
  // isliye use bhi chhod dete hain taaki naya request fresh read kare.
  inflight.delete(sheetName);
};

const readSheet = async (sheetName) => {
  const attempts = Number(process.env.SHEET_READ_ATTEMPTS || 3);
  const data = await withRetry(
    () => post({ action: 'read', sheetName }, readTimeout()),
    { attempts, baseDelay: 700 }
  );
  const rows = extractRows(data);
  cache.set(sheetName, { ts: Date.now(), data: rows });
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
