const ContactInquiry = require('../models/ContactInquiry');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all contact inquiries with pagination, filtering & search
 * @route   GET /api/contacts
 * @access  Private (Admin)
 */
const getContactInquiries = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status.toUpperCase();

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { phone: searchRegex },
        { message: searchRegex }
      ];
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [inquiries, total] = await Promise.all([
      ContactInquiry.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      ContactInquiry.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return sendSuccess(
      res,
      200,
      'Contact inquiries fetched successfully',
      { inquiries },
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single contact inquiry by ID
 * @route   GET /api/contacts/:id
 * @access  Private (Admin)
 */
const getContactInquiryById = async (req, res, next) => {
  try {
    const inquiry = await ContactInquiry.findById(req.params.id);
    if (!inquiry) {
      return sendError(res, 404, 'Contact inquiry not found');
    }
    return sendSuccess(res, 200, 'Contact inquiry fetched successfully', { inquiry });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a contact inquiry
 * @route   POST /api/contacts
 * @access  Public
 */
const createContactInquiry = async (req, res, next) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return sendError(res, 400, 'Full name, email, and message are required');
    }

    const inquiry = await ContactInquiry.create({
      fullName,
      email,
      phone: phone || '',
      subject: subject || 'General Inquiry',
      message,
      status: 'NEW'
    });

    return sendSuccess(res, 201, 'Contact inquiry submitted successfully', { inquiry });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update contact inquiry status
 * @route   PUT /api/contacts/:id
 * @access  Private (Admin)
 */
const updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return sendError(res, 400, 'Status is required');
    }

    const inquiry = await ContactInquiry.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { returnDocument: 'after', runValidators: true }
    );

    if (!inquiry) {
      return sendError(res, 404, 'Contact inquiry not found');
    }

    return sendSuccess(res, 200, 'Contact inquiry status updated successfully', { inquiry });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete contact inquiry
 * @route   DELETE /api/contacts/:id
 * @access  Private (Admin)
 */
const deleteContactInquiry = async (req, res, next) => {
  try {
    const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return sendError(res, 404, 'Contact inquiry not found');
    }
    return sendSuccess(res, 200, 'Contact inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getContactInquiries,
  getContactInquiryById,
  createContactInquiry,
  updateContactStatus,
  deleteContactInquiry
};
