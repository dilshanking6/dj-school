const axios = require('axios');
const { HttpError } = require('../middleware/auth');

/**
 * Free file store — files seedha Google Drive me jaate hain.
 *
 * Render ka free plan ephemeral disk deta hai (restart par sab udd jaata hai)
 * aur 15 GB ka koi add-on free nahi milta. Google Drive free me 15 GB deta hai
 * aur hum already Apps Script wala stack use kar rahe hain, isliye isi me
 * upload kar dete hain.
 *
 * Flow:
 *   browser  ->  POST /api/files  (base64, max 25 MB)
 *   server   ->  Apps Script web app (HTTPS, 443 — free plan par allowed)
 *   Apps     ->  Drive folder "Digital Janta - File Store"
 *   wapas    ->  { url, viewUrl, id, size }  sirf link store hota hai
 */

const fileUrl = () => process.env.APPS_SCRIPT_FILE_URL;
const fileToken = () => process.env.APPS_SCRIPT_FILE_TOKEN;

/** Body limit. base64 me 33% overhead hoti hai, isliye raw limit se zyada. */
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILE_MB = Math.round(MAX_FILE_BYTES / (1024 * 1024));

/**
 * Extension -> MIME. Browser `File.type` bhejta hai, par kuch purane browsers
 * ya `.docx` jaise office files khali bhejte hain, tab ye kaam aata hai.
 */
const MIME_BY_EXT = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  m4v: 'video/x-m4v',
  '3gp': 'video/3gpp',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  txt: 'text/plain',
  csv: 'text/csv',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip'
};

/**
 * Wahi MIME types jo school ko chahiye: PDF, image, video + thoda office docs.
 * HTML/SVG isliye nahi — agar kabhi bhi wo link kisi page me embed hua to
 * script chal sakta hai. Download link par bhi behtar hai bachna.
 */
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/3gpp',
  'video/x-msvideo', 'video/x-matroska',
  'audio/mpeg', 'audio/mp4', 'audio/wav',
  'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip'
]);

const fileStoreConfigured = () => Boolean(fileUrl() && fileToken());

const extensionOf = (name) => {
  const match = /\.([a-z0-9]{1,8})$/i.exec(String(name || '').trim());
  return match ? match[1].toLowerCase() : '';
};

const mimeFor = (name, given) => {
  const hinted = String(given || '').split(';')[0].trim().toLowerCase();
  if (hinted && hinted !== 'application/octet-stream' && ALLOWED_MIME.has(hinted)) return hinted;

  const fromExt = MIME_BY_EXT[extensionOf(name)];
  if (fromExt) return fromExt;

  if (hinted && ALLOWED_MIME.has(hinted)) return hinted;
  return null;
};

const encodeBase64 = (buffer) => {
  // Buffer ek byte array hai — Node ka `.toString('base64')` sabse tez hai
  // aur purane Buffer polyfills me kaam karta hai.
  if (typeof buffer.toString === 'function') return buffer.toString('base64');
  return Buffer.from(buffer).toString('base64');
};

/**
 * Ek file validate kar ke Drive me bhejta hai.
 *
 * @param {object} input
 * @param {string} input.name      original filename
 * @param {Buffer} input.data      already-read bytes
 * @param {string} [input.mimeType] browser ka guess (optional)
 * @returns {Promise<{id,url,name,size,mimeType}>}
 */
const uploadFile = async ({ name, data, mimeType }) => {
  if (!fileStoreConfigured()) {
    throw new HttpError(
      503,
      'File storage is not set up yet. Deploy server/scripts/appsScriptDrive.gs and set APPS_SCRIPT_FILE_URL + APPS_SCRIPT_FILE_TOKEN in Render.'
    );
  }

  const originalName = String(name || '').trim().slice(0, 180) || 'file';
  const bytes = data || Buffer.alloc(0);

  if (!bytes.length) throw new HttpError(400, 'File is empty');
  if (bytes.length > MAX_FILE_BYTES) {
    throw new HttpError(413, `File is too large (max ${MAX_FILE_MB} MB)`);
  }

  const resolvedMime = mimeFor(originalName, mimeType);
  if (!resolvedMime) {
    const ext = extensionOf(originalName) || 'unknown';
    throw new HttpError(
      415,
      `This file type (.${ext}) is not allowed. Allowed: PDF, images (png/jpg/webp/gif), videos (mp4/webm/mov), audio, Word/Excel/PowerPoint and zip.`
    );
  }

  try {
    const { data: res } = await axios.post(
      fileUrl(),
      {
        action: 'upload',
        token: fileToken(),
        name: originalName,
        mimeType: resolvedMime,
        base64: encodeBase64(bytes)
      },
      { timeout: Number(process.env.FILE_UPLOAD_TIMEOUT || 60000), maxBodyLength: Infinity, maxContentLength: Infinity }
    );

    // Apps Script hamesha 200 bhejta hai — error JSON me hota hai.
    if (!res || res.error || !res.ok) {
      throw new HttpError(502, res?.error || 'File service did not accept the file');
    }

    return {
      id: res.id,
      url: res.viewUrl || res.url,
      downloadUrl: res.url,
      name: res.name || originalName,
      size: Number(res.size) || bytes.length,
      mimeType: resolvedMime
    };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    // Network/timeout/Drive quota sab yahan aate hain.
    if (error.response?.data?.error) throw new HttpError(502, String(error.response.data.error));
    const timedOut = error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '');
    throw new HttpError(
      timedOut ? 504 : 502,
      timedOut
        ? 'File upload timed out. The file may be too big for the free plan — try a smaller file.'
        : 'Could not reach file storage. Please try again.'
    );
  }
};

/** `/api/status` me dikhane ke liye — kya file store chalu hai. */
const fileStoreStatus = () => ({
  available: fileStoreConfigured(),
  maxMB: MAX_FILE_MB,
  transport: fileStoreConfigured() ? 'google-drive' : 'none'
});

module.exports = { uploadFile, fileStoreConfigured, fileStoreStatus, MAX_FILE_BYTES, MAX_FILE_MB, ALLOWED_MIME, mimeFor };
