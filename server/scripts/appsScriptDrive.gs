/**
 * Digital Janta — FREE file store (Google Drive pe PDF / image / video).
 *
 * KYUN: Sirf baaki jagah jagah nahi hai — student form ke saath PDF, photo ya
 * video bhej sakta hai, aur principal/admin ke dashboard par wo file khulti
 * hai. Files Google Drive me jaati hain (free: 15 GB), server par kuch store
 * nahi hota. Render free disk restart par udd jaati hai, isliye Drive hi
 * sahi jagah hai.
 *
 * Ye bilkul alag file hai `appsScriptMail.gs` se — dono ko alag-alag project
 * me deploy karna hai.
 *
 * ---------------------------------------------------------------------------
 *  SETUP (5 minute)
 * ---------------------------------------------------------------------------
 *  1. https://script.google.com  kholo  ->  "+ New project"
 *  2. Poora ye file ka content paste kar do (upar ka comment block bhi).
 *  3. Neeche DRIVE_TOKEN ki value badal do (koi bhi lambi random string).
 *  4. Deploy -> New deployment
 *        Type   : Web app
 *        Execute as : Me (aapka Google account)
 *        Who has access : Anyone
 *     -> Deploy  ->  ek URL milega:
 *        https://script.google.com/macros/s/AKfyc.../exec
 *  5. Wo URL Render me `APPS_SCRIPT_FILE_URL` me daalo, aur wahi
 *     jo token neeche daala tha wo `APPS_SCRIPT_FILE_TOKEN` me.
 *  6. Render me **Manual Deploy -> Deploy latest commit** dabao
 *     (env change par auto deploy nahi chalta).
 *
 * ---------------------------------------------------------------------------
 *  PRIVACY: files par "Anyone with the link — Viewer" lagta hai. Link Drive ka
 *  random ID wala hota hai (pata lagana mushkil), aur students ke form answers
 *  ke liye ye sabse simple free tarika hai. Agar files bilkul private chahiye
 *  to `PUBLIC_LINKS` ko false kar do — tab sirf aapke Google account se files
 *  khulengi aur server proxy kar ke dikhayega.
 *
 *  QUOTA: Drive free 15 GB. Ek file max 25 MB (server side limit).
 * ---------------------------------------------------------------------------
 */

// Wo lambi random string jo Render ke APPS_SCRIPT_FILE_TOKEN me hai.
// Dono jagah SAME honi chahiye, warna upload nahi hoga.
var DRIVE_TOKEN = 'YAHAN_APNA_LAMBA_RANDOM_TOKEN_DALO_KOI_BHI_40_CHAR_KI';

// Files kis folder me rakhni hain. Pehli baar run par khud ban jaayega.
var FOLDER_NAME = 'Digital Janta - File Store';

// true  -> link share karne wala koi bhi file dekh sakta hai (default)
// false -> sirf aapka Google account dekh sakta hai
var PUBLIC_LINKS = true;

// Kitni file ek din me upload ho sakti hain (DoS se bachne ke liye).
var DAILY_UPLOADS = 500;

// ---------------------------------------------------------------------------
//  Neeche ka code chhedna zaruri nahi.
// ---------------------------------------------------------------------------

function doGet() {
  return json_({ ok: true, service: 'Digital Janta file store', hasToken: !!DRIVE_TOKEN });
}

function doPost(e) {
  var body = {};

  try {
    body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  } catch (err) {
    return json_({ error: 'Malformed JSON body' });
  }

  var given = String(body.token || header_(e, 'x-file-token') || '');
  if (!DRIVE_TOKEN || given !== DRIVE_TOKEN) return json_({ error: 'Unauthorized' }, 401);

  if (body.action === 'upload') return upload_(body);
  if (body.action === 'info') return info_(body);
  return json_({ error: 'Unknown action' });
}

/**
 * base64 file le kar Drive me daal do aur link wapas bhej do.
 * Server yahi base64 bhejta hai (JSON body me), isliye multipart ki
 * zarurat nahi padi — koi extra npm package nahi chahiye.
 */
function upload_(body) {
  if (!quota_()) return json_({ error: 'Daily upload limit reached. Try again tomorrow.' }, 429);

  var name = String(body.name || 'file').trim().slice(0, 180);
  var mimeType = String(body.mimeType || 'application/octet-stream').trim().slice(0, 120);
  var base64 = String(body.base64 || '');
  if (!base64) return json_({ error: 'Empty file' });

  var blob;
  try {
    blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, name);
  } catch (err) {
    console.error('decode fail :: ' + (err && err.message ? err.message : err));
    return json_({ error: 'Could not decode file' }, 400);
  }

  try {
    var file = folder_().createFile(blob);

    if (PUBLIC_LINKS) {
      // "Anyone with the link" = viewer. Ye students ko file dikhane ke
      // liye zaroori hai, warna unke login se Drive link nahi khulega.
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    console.log('upload ok -> ' + name + ' (' + file.getSize() + ' bytes)');
    return json_({
      ok: true,
      id: file.getId(),
      name: file.getName(),
      size: file.getSize(),
      mimeType: mimeType,
      // Direct render-able link (browser me <a>/<img> seedha kholta hai).
      url: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
      viewUrl: 'https://drive.google.com/file/d/' + file.getId() + '/view'
    });
  } catch (err) {
    console.error('upload fail -> ' + name + ' :: ' + (err && err.message ? err.message : err));
    return json_({ error: 'Drive rejected the file' }, 502);
  }
}

/** Sirf file ka naam/size wapas dikhata hai (health check ke liye). */
function info_(body) {
  try {
    var file = DriveApp.getFileById(String(body.id || ''));
    return json_({ ok: true, name: file.getName(), size: file.getSize() });
  } catch (err) {
    return json_({ error: 'File not found' }, 404);
  }
}

/** Folder pehle se hai to wahi, warna naya banao. */
function folder_() {
  var props = PropertiesService.getScriptProperties();
  var saved = props.getProperty('DJ_FILE_FOLDER_ID');
  if (saved) {
    try {
      return DriveApp.getFolderById(saved);
    } catch (err) {
      props.deleteProperty('DJ_FILE_FOLDER_ID'); // folder delete ho gaya hoga
    }
  }

  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('DJ_FILE_FOLDER_ID', folder.getId());
  return folder;
}

function quota_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var bucket = 'DJ_FILE_COUNT_' + Math.floor(Date.now() / 86400000);
    var n = Number(props.getProperty(bucket) || 0);
    if (n >= DAILY_UPLOADS) return false;
    props.setProperty(bucket, String(n + 1));

    var keys = props.getKeys();
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('DJ_FILE_COUNT_') === 0 && keys[i] !== bucket) props.deleteProperty(keys[i]);
    }
    return true;
  } catch (err) {
    return true; // quota check fail ho to upload block mat karo
  }
}

function header_(e, name) {
  try {
    var h = e.parameterHeaders || e.headers || {};
    for (var k in h) if (k.toLowerCase() === name) return h[k];
  } catch (err) {}
  return '';
}

function json_(obj, status) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  // Apps Script web app hamesha 200 bhejta hai — server `error` field padh
  // kar failure samajhta hai (fileStore.js `response.data.error` check).
  if (status && status >= 400) console.warn('responding ' + status + ': ' + JSON.stringify(obj));
  return output;
}
