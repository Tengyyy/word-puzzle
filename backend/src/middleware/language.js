export function detectLanguage(req, res, next) {
  const acceptLanguage = req.headers['accept-language'] || 'et';
  res.locals.language = acceptLanguage === 'en' ? 'en' : 'et'; // fallback to 'et'
  next();
}