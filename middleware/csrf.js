import { config } from '../config.js';
import bcrypt from 'bcrypt';

const CSRF_SECRET_KEY = config.csrf.secretKey;

export const csrfCheck = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'OPTIONS' || req.method === 'HEAD') {
    return next();
  }

  const csrfHeader = req.get('_csrf-token');

  if (!csrfHeader) {
    console.warn('', req.headers.origin);
    return res.status(403).json({
      message: `SECURE_CSRF : IS_NOT_EXISTS : ${csrfHeader}`,
    });
  }

  validateCsrfToken(csrfHeader) //
    .then(value => {
      if (!value) {
        console.warn('', req.headers.origin, csrfHeader);
        return res.status(403).json({
          message: `SECURE_CSRF : IS_NOT_VALID : ${csrfHeader}`,
        });
      }
      next();
    })
    .catch(err => {
      console.log(err);
      return res.status(500).json({
        message: `SECURE_CSRF : IS_NOT_VALID : ${csrfHeader}`,
      });
    });
};

async function validateCsrfToken(csrfHeader) {
  return bcrypt.compare(CSRF_SECRET_KEY, csrfHeader);
}
