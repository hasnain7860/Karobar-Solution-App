import jwt from 'jsonwebtoken';

// Isse apni .env.local file mein add karein
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

/**
 * Token sign karta hai (Payload ke saath)
 * @param {object} payload - Data jo token mein store karna hai (e.g., userId, role)
 * @returns {string} - Generated JWT
 */
export function signJwt(payload) {
  // Token 30 din ke liye valid hai
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Token ko verify aur decode karta hai
 * @param {string} token - User ka JWT
 * @returns {object | null} - Decoded payload ya null agar invalid hai
 */
export function verifyJwt(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    // Token invalid ya expire ho gaya
    return null;
  }
}


