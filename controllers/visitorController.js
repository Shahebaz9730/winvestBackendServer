const Visitor = require('../models/Visitor');
const { sendSuccess } = require('../utils/responseHandler');

const trackVisitor = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Optional: Agar aap chahte hain ki ek IP se din me ek hi baar count ho, toh check laga sakte hain.
    // Abhi ke liye har page load/visit par count badhega:
    await Visitor.create({ ipAddress, userAgent });

    return sendSuccess(res, 200, 'Visitor tracked successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { trackVisitor };