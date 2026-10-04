const Complaint = require('../models/Complaint');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all complaints with pagination, filtering & search
 * @route   GET /api/complaints
 * @access  Private (Admin)
 */
const getComplaints = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (priority) filter.priority = priority.toUpperCase();

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { phone: searchRegex }
      ];
    }

    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [complaints, total] = await Promise.all([
      Complaint.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Complaint.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return sendSuccess(
      res,
      200,
      'Complaints fetched successfully',
      { complaints },
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
 * @desc    Get single complaint by ID
 * @route   GET /api/complaints/:id
 * @access  Private (Admin)
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }
    return sendSuccess(res, 200, 'Complaint fetched successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new complaint
 * @route   POST /api/complaints
 * @access  Public / Private
 */
const createComplaint = async (req, res, next) => {
  try {
    const { name, email, phone, subject, complaintText, priority } = req.body;

    if (!name || !email || !subject || !complaintText) {
      return sendError(res, 400, 'Name, email, subject, and complaint text are required');
    }

    const complaint = await Complaint.create({
      name,
      email,
      phone: phone || '',
      subject,
      complaintText,
      priority: priority || 'MEDIUM',
      status: 'PENDING'
    });

    return sendSuccess(res, 201, 'Complaint submitted successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update complaint status and admin notes
 * @route   PUT /api/complaints/:id
 * @access  Private (Admin)
 */
const updateComplaint = async (req, res, next) => {
  try {
    const { status, priority, adminNotes } = req.body;
    const updates = {};

    if (status) updates.status = status.toUpperCase();
    if (priority) updates.priority = priority.toUpperCase();
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }

    return sendSuccess(res, 200, 'Complaint updated successfully', { complaint });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete complaint
 * @route   DELETE /api/complaints/:id
 * @access  Private (Admin)
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return sendError(res, 404, 'Complaint not found');
    }
    return sendSuccess(res, 200, 'Complaint deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint
};
