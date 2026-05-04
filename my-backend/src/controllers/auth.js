const bcrypt = require('bcrypt');
const crypto = require('crypto');
const usersService = require('../services/users');

/**
 * Helper: constant-time comparison for hex strings
 */
function safeHexCompare(a, b) {
  try {
    const bufA = Buffer.from(String(a), 'utf8');
    const bufB = Buffer.from(String(b), 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (e) {
    return false;
  }
}

/**
 * Small fake verify to mitigate user-enumeration timing attacks
 * performs a bcrypt hash/compare on random data to consume time similar to a real check
 */
async function fakeVerifyDelay() {
  const fakeHash = await bcrypt.hash(crypto.randomBytes(8).toString('hex'), 10);
  try { await bcrypt.compare('fake-password', fakeHash); } catch (e) { /* ignore */ }
}

/**
 * POST /api/login
 * - expects JSON body: { email, password }
 * - does not reveal whether email exists (generic error on failure)
 * - supports bcrypt hashes and legacy MD5 hex hashes (32 hex chars)
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    // Basic input validation
    if (!email || !password) {
      return res.status(400).json({ status: 'Fail', message: 'Email and password are required.' });
    }

    // simple email format check
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(String(email))) {
      return res.status(400).json({ status: 'Fail', message: 'Invalid email format.' });
    }

    // Lookup user record (may be async file read)
    const user = await usersService.getUserByEmail(email);

    // If user not found, perform fake delay and return generic error to avoid enumeration
    if (!user) {
      await fakeVerifyDelay();
      return res.status(401).json({ status: 'Fail', message: 'Invalid email or password.' });
    }

    const stored = String(user.password || '');

    let passwordMatches = false;

    // If stored password looks like a bcrypt hash (starts with $2)
    if (stored.startsWith('$2')) {
      passwordMatches = await bcrypt.compare(password, stored);
    } else if (/^[a-f0-9]{32}$/i.test(stored)) {
      // Legacy MD5 stored as hex: compute MD5 and compare in constant time
      const md5 = crypto.createHash('md5').update(password).digest('hex');
      passwordMatches = safeHexCompare(md5, stored);
    } else {
      // Unknown format: do a safe compare to avoid leaking info
      passwordMatches = safeHexCompare(password, stored);
    }

    if (!passwordMatches) {
      // Generic failure message (do not reveal which part failed)
      return res.status(401).json({ status: 'Fail', message: 'Invalid email or password.' });
    }

    // Authentication successful
    // Remove sensitive fields before responding
    const safeUser = Object.assign({}, user);
    delete safeUser.password;

    return res.status(200).json({ status: 'Success', data: safeUser });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ status: 'Fail', message: 'Internal server error.' });
  }
}

module.exports = { login };