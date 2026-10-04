const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: [true, 'Advertisement type is required'],
            enum: {
                values: ['LEFT', 'RIGHT'],
                message: 'Type must be LEFT or RIGHT'
            },
            uppercase: true,
            trim: true
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        subtitles: {
            type: [String],
            default: []
        },
        personName: {
            type: String,
            trim: true,
            maxlength: [100, 'Person name cannot exceed 100 characters'],
            default: ''
        },
        contactNumber: {
            type: String,
            trim: true,
            maxlength: [20, 'Contact number cannot exceed 20 characters'],
            default: ''
        },
        link: {
            type: String,
            trim: true,
            default: ''
        },
        personImage: {
            type: String,
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Created by user ID is required']
        }
    },
    {
        timestamps: true
    }
);

advertisementSchema.index({ type: 1 });
advertisementSchema.index({ createdAt: -1 });

advertisementSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
