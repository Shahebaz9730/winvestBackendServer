const Recommendation = require('../models/Recommendation');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create a new stock recommendation
 * @route   POST /api/recommendations
 * @access  Private (Admin)
 */


const createRecommendation = async (req, res, next) => {
  try {
    const {
      stockName,
      symbol,
      action,
      exchange,
      entryPrice,
      targetPrice,
      stopLoss,
      currentPrice,
      recommendationDate,
      validTill,
      status,
      researchReason
    } = req.body;

    const userId = req.user.userId || req.user.id;

    // Securely associate with the authenticated user, ignoring any client-provided createdBy
    const recommendation = await Recommendation.create({
      stockName,
      symbol,
      action,
      exchange: exchange || 'NSE',
      entryPrice,
      targetPrice,
      stopLoss,
      currentPrice: currentPrice !== undefined ? currentPrice : entryPrice,
      recommendationDate: recommendationDate || Date.now(),
      validTill: validTill || undefined,
      status: status || 'ACTIVE',
      researchReason: researchReason || '',
      createdBy: userId
    });

    // Populate createdBy details for response from users collection
    await recommendation.populate('createdBy', 'username role');

    const io = req.app.get('socketio');
    if (io) {
      io.emit('recommendation_created', recommendation);
    }

    return sendSuccess(res, 201, 'Recommendation created successfully', { recommendation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recommendations with filtering, search, pagination, and sorting
 * @route   GET /api/recommendations
 * @access  Private (Admin)
 */
const getRecommendations = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      action,
      status,
      exchange,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};

    if (action) {
      filter.action = action.toUpperCase();
    }

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (exchange) {
      filter.exchange = exchange.toUpperCase();
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { stockName: searchRegex },
        { symbol: searchRegex }
      ];
    }

    // Sort order
    const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    const [recommendations, total] = await Promise.all([
      Recommendation.find(filter)
        .populate('createdBy', 'username role')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Recommendation.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;

    const meta = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    };

    return sendSuccess(res, 200, 'Recommendations fetched successfully', { recommendations }, meta);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single recommendation by ID
 * @route   GET /api/recommendations/:id
 * @access  Private (Admin)
 */
const getRecommendationById = async (req, res, next) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate('createdBy', 'username role');

    if (!recommendation) {
      return sendError(res, 404, 'Recommendation not found');
    }

    return sendSuccess(res, 200, 'Recommendation fetched successfully', { recommendation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing recommendation
 * @route   PUT /api/recommendations/:id
 * @access  Private (Admin)
 */
const updateRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Whitelist updatable fields to prevent unauthorized overwrite of createdBy, _id, createdAt
    const updatableFields = [
      'stockName',
      'symbol',
      'action',
      'exchange',
      'entryPrice',
      'targetPrice',
      'stopLoss',
      'currentPrice',
      'recommendationDate',
      'validTill',
      'status',
      'researchReason'
    ];

    const updates = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedRecommendation = await Recommendation.findByIdAndUpdate(
      id,
      updates,
      {
        returnDocument: 'after',
        runValidators: true
      }
    ).populate('createdBy', 'username role');

    // 1. Pehle check karein ki recommendation exist karti hai ya nahi
    if (!updatedRecommendation) {
      return sendError(res, 404, 'Recommendation not found');
    }

    // 2. Phir Socket emit karein (kyunki ab item confirm mil gaya hai)
    const io = req.app.get('socketio');
    if (io) {
      io.emit('recommendation_updated', updatedRecommendation);
    }

    return sendSuccess(res, 200, 'Recommendation updated successfully', { recommendation: updatedRecommendation });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a recommendation
 * @route   DELETE /api/recommendations/:id
 * @access  Private (Admin)
 */
const deleteRecommendation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recommendation = await Recommendation.findByIdAndDelete(id);

    // 1. Pehle check karein ki item exist karta tha ya nahi
    if (!recommendation) {
      return sendError(res, 404, 'Recommendation not found');
    }

    // 2. Phir Socket emit karein taaki frontend se instantly remove ho jaye
    const io = req.app.get('socketio');
    if (io) {
      io.emit('recommendation_deleted', id);
    }

    return sendSuccess(res, 200, 'Recommendation deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRecommendation,
  getRecommendations,
  getRecommendationById,
  updateRecommendation,
  deleteRecommendation
};


// idr se old
// const Recommendation = require('../models/Recommendation');
// const { sendSuccess, sendError } = require('../utils/responseHandler');

// /**
//  * @desc    Create a new stock recommendation
//  * @route   POST /api/recommendations
//  * @access  Private (Admin)
//  */
// const createRecommendation = async (req, res, next) => {
//   try {
//     const {
//       stockName,
//       symbol,
//       action,
//       exchange,
//       entryPrice,
//       targetPrice,
//       stopLoss,
//       currentPrice,
//       recommendationDate,
//       validTill,
//       status,
//       researchReason
//     } = req.body;

//     const userId = req.user.userId || req.user.id;

//     // Securely associate with the authenticated user
//     const recommendation = await Recommendation.create({
//       stockName,
//       symbol,
//       action,
//       exchange: exchange || 'NSE',
//       entryPrice,
//       targetPrice,
//       stopLoss,
//       currentPrice: currentPrice !== undefined ? currentPrice : entryPrice,
//       recommendationDate: recommendationDate || Date.now(),
//       validTill: validTill || undefined,
//       status: status || 'ACTIVE',
//       researchReason: researchReason || '',
//       createdBy: userId
//     });

//     // Populate createdBy details
//     await recommendation.populate('createdBy', 'username role');

//     // SOCKET.IO EVENT: Send live new recommendation event to all connected clients
//     const io = req.app.get('io');
//     if (io) {
//       io.emit('recommendation_created', recommendation);
//     }

//     return sendSuccess(res, 201, 'Recommendation created successfully', { recommendation });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Get all recommendations with filtering, search, pagination, and sorting
//  * @route   GET /api/recommendations
//  * @access  Private (Admin)
//  */
// const getRecommendations = async (req, res, next) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       action,
//       status,
//       exchange,
//       search,
//       sortBy = 'createdAt',
//       order = 'desc'
//     } = req.query;

//     const pageNum = Math.max(1, parseInt(page, 10) || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
//     const skip = (pageNum - 1) * limitNum;

//     // Build filter query
//     const filter = {};

//     if (action) {
//       filter.action = action.toUpperCase();
//     }

//     if (status) {
//       filter.status = status.toUpperCase();
//     }

//     if (exchange) {
//       filter.exchange = exchange.toUpperCase();
//     }

//     if (search) {
//       const searchRegex = new RegExp(search.trim(), 'i');
//       filter.$or = [
//         { stockName: searchRegex },
//         { symbol: searchRegex }
//       ];
//     }

//     // Sort order
//     const sortOrder = order.toLowerCase() === 'asc' ? 1 : -1;
//     const sortOptions = { [sortBy]: sortOrder };

//     const [recommendations, total] = await Promise.all([
//       Recommendation.find(filter)
//         .populate('createdBy', 'username role')
//         .sort(sortOptions)
//         .skip(skip)
//         .limit(limitNum)
//         .lean(),
//       Recommendation.countDocuments(filter)
//     ]);

//     const totalPages = Math.ceil(total / limitNum) || 1;

//     const meta = {
//       page: pageNum,
//       limit: limitNum,
//       total,
//       totalPages,
//       hasNextPage: pageNum < totalPages,
//       hasPrevPage: pageNum > 1
//     };

//     return sendSuccess(res, 200, 'Recommendations fetched successfully', { recommendations }, meta);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Get a single recommendation by ID
//  * @route   GET /api/recommendations/:id
//  * @access  Private (Admin)
//  */
// const getRecommendationById = async (req, res, next) => {
//   try {
//     const recommendation = await Recommendation.findById(req.params.id)
//       .populate('createdBy', 'username role');

//     if (!recommendation) {
//       return sendError(res, 404, 'Recommendation not found');
//     }

//     return sendSuccess(res, 200, 'Recommendation fetched successfully', { recommendation });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Update an existing recommendation
//  * @route   PUT /api/recommendations/:id
//  * @access  Private (Admin)
//  */
// const updateRecommendation = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const updatableFields = [
//       'stockName',
//       'symbol',
//       'action',
//       'exchange',
//       'entryPrice',
//       'targetPrice',
//       'stopLoss',
//       'currentPrice',
//       'recommendationDate',
//       'validTill',
//       'status',
//       'researchReason'
//     ];

//     const updates = {};
//     for (const field of updatableFields) {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     }

//     const updatedRecommendation = await Recommendation.findByIdAndUpdate(
//       id,
//       updates,
//       {
//         returnDocument: 'after',
//         runValidators: true
//       }
//     ).populate('createdBy', 'username role');

//     if (!updatedRecommendation) {
//       return sendError(res, 404, 'Recommendation not found');
//     }

//     // SOCKET.IO EVENT: Send live update event
//     const io = req.app.get('io');
//     if (io) {
//       io.emit('recommendation_updated', updatedRecommendation);
//     }

//     return sendSuccess(res, 200, 'Recommendation updated successfully', { recommendation: updatedRecommendation });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc    Delete a recommendation
//  * @route   DELETE /api/recommendations/:id
//  * @access  Private (Admin)
//  */
// const deleteRecommendation = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const recommendation = await Recommendation.findByIdAndDelete(id);

//     if (!recommendation) {
//       return sendError(res, 404, 'Recommendation not found');
//     }

//     // SOCKET.IO EVENT: Send live delete event
//     const io = req.app.get('io');
//     if (io) {
//       io.emit('recommendation_deleted', { id });
//     }

//     return sendSuccess(res, 200, 'Recommendation deleted successfully');
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createRecommendation,
//   getRecommendations,
//   getRecommendationById,
//   updateRecommendation,
//   deleteRecommendation
// };