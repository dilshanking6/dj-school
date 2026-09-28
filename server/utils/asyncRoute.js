const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
  return undefined;
};

module.exports = asyncRoute;
