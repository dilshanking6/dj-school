const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const asyncRoute = require('../utils/asyncRoute');
const { uploadFile, fileStoreStatus, MAX_FILE_MB } = require('../utils/fileStore');
const v = require('../middleware/validate');

/**
 * File upload endpoint.
 *
 * Ye router sirf isliye alag hai aur index.js me global `express.json({limit:
 * '256kb'})` se PEHLE mount hota hai — kyunki 25 MB ka PDF base64 me ~34 MB
 * JSON ban jaata hai, aur 256 kb ki limit pehle hi request ko 413 de deti.
 *
 * Multipart/form-data ke bajaye JSON base64 use karte hain — koi extra npm
 * package (multer/busboy) nahi chahiye, aur free plan par bhi kaam karta hai.
 */
const router = express.Router();

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, max: 12,
  message: 'You are uploading files very quickly. Please wait a moment.'
});

// base64 ka size = file ka ~1.34x. 25 MB file = ~34 MB text.
const BASE64_MAX = 40 * 1000 * 1000;

router.use(authenticate);

router.get('/status', (req, res) => res.json(fileStoreStatus()));

router.post(
  '/upload',
  authorize('student', 'teacher', 'principal', 'admin'),
  uploadLimiter,
  asyncRoute(async (req, res) => {
    const name = v.text(req.body.name, 'File name', { max: 180 });
    const mimeType = v.optionalText(req.body.mimeType, 'File type', { max: 120 });
    const base64 = v.text(req.body.base64, 'File', { max: BASE64_MAX });

    const file = await uploadFile({ name, data: Buffer.from(base64, 'base64'), mimeType });

    res.status(201).json({
      success: true,
      file,
      message: `Uploaded — ${file.name} (${Math.round(file.size / 1024)} KB, max ${MAX_FILE_MB} MB)`
    });
  })
);

module.exports = router;
