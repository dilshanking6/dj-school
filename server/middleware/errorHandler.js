const { HttpError } = require('./auth');

const notFound = (req, res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  // Body parser ki raw parse error user ko nahi dikhani chahiye.
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Malformed request. Please reload the page and try again.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That upload is too large. Share a document link instead.' });
  }

  const status = Number(err.status || err.statusCode || 500);

  if (status >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  const body = {
    // `expose` wale errors ka message khud user ke liye likha gaya hota hai
    // ("Email par code nahi bhej paaye"), isliye wo seedha dikhana zaroori hai.
    // Asli technical wajah (env var, SMTP ka raw message) hamesha log me
    // rahegi, browser tak nahi aani chahiye.
    error: err.expose && err.message
      ? err.message
      : status >= 500
        ? 'Something went wrong on our end. Please try again.'
        : err.message
  };

  if (status >= 500 && process.env.NODE_ENV !== 'production') {
    body.detail = err.message;
  }

  return res.status(status).json(body);
};

module.exports = { notFound, errorHandler };
