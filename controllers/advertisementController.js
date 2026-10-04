const mongoose = require('mongoose');
const Advertisement = require('../models/Advertisement');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create a new advertisement
 * @route   POST /api/advertisements
 * @access  Private (Admin)
 */
const createAdvertisement = async (req, res, next) => {
    try {
        const {
            type,
            title,
            subtitles,
            personName,
            contactNumber,
            link,
            personImage
        } = req.body;

        // Always take createdBy from authenticated token — never from frontend
        const userId = req.user.userId || req.user.id;

        const advertisement = await Advertisement.create({
            type: type ? type.toUpperCase() : type,
            title,
            subtitles: subtitles || [],
            personName: personName || '',
            contactNumber: contactNumber || '',
            link: link || '',
            personImage: personImage || null,
            createdBy: userId
        });

        await advertisement.populate('createdBy', 'username role');

        return sendSuccess(res, 201, 'Advertisement created successfully', { advertisement });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete an advertisement
 * @route   DELETE /api/advertisements/:id
 * @access  Private (Admin)
 */
const deleteAdvertisement = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return sendError(res, 400, 'Invalid advertisement ID format');
        }

        const advertisement = await Advertisement.findByIdAndDelete(id);

        if (!advertisement) {
            return sendError(res, 404, 'Advertisement not found');
        }

        return sendSuccess(res, 200, 'Advertisement deleted successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all advertisements with optional filters
 * @route   GET /api/advertisements
 * @access  Public
 */
const getAdvertisements = async (req, res, next) => {
    try {
        const { type } = req.query;

        const filter = {};

        if (type) {
            filter.type = type.toUpperCase();
        }

        const advertisements = await Advertisement.find(filter)
            .populate('createdBy', 'username role')
            .sort({ createdAt: -1 })
            .lean();

        return sendSuccess(res, 200, 'Advertisements fetched successfully', { advertisements });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAdvertisement,
    deleteAdvertisement,
    getAdvertisements
};
