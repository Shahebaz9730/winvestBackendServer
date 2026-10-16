const mongoose = require('mongoose');

const imgAdvertisementSchema = new mongoose.Schema(
  {
    imageType: {
      type: String,
      required: [true, 'Image type is required'],
      enum: ['LONG', 'BIG_SQUARE', 'SHORT_SQUARE', 'WIDE_WIDTH'],
      default: 'BIG_SQUARE',
      uppercase: true
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required']
    }
  },
  {
    timestamps: true,
    collection: 'imgadvertisements'
  }
);

const ImgAdvertisement = mongoose.model('ImgAdvertisement', imgAdvertisementSchema);

module.exports = ImgAdvertisement;