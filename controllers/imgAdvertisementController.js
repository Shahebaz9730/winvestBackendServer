const ImgAdvertisement = require("../models/ImgAdvertisement");
const fs = require("fs");
const path = require("path");

// 1. Upload Multiple Images with Image Type
exports.uploadImgAdvertisement = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload at least one image" });
    }

    // Saari uploaded images ke relative paths ka array bana lo
    const imagePaths = req.files.map(file => `/uploads/advertisements/${file.filename}`);

    const newAd = await ImgAdvertisement.create({
      imageType: req.body.imageType ? req.body.imageType.toUpperCase() : "BIG_SQUARE",
      images: imagePaths,
    });

    res.status(201).json({
      success: true,
      message: "Advertisements uploaded successfully",
      data: newAd,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Advertisements (Optional filter by ?imageType=LONG)
exports.getImgAdvertisements = async (req, res) => {
  try {
    const { imageType } = req.query;
    const filter = imageType ? { imageType: imageType.toUpperCase() } : {};

    const ads = await ImgAdvertisement.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Delete Advertisement & Remove Files from Disk
exports.deleteImgAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await ImgAdvertisement.findById(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    // Disk storage se is record ki saari images delete karo
    ad.images.forEach(imgPath => {
      const filePath = path.join(__dirname, "..", imgPath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await ImgAdvertisement.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Advertisement & Handle Old/New Files
exports.updateImgAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await ImgAdvertisement.findById(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    let updatedImages = ad.images; // Default purani images rakho

    // Agar nayi files upload hui hain
    if (req.files && req.files.length > 0) {
      // Pehle disk se purani saari images delete karo
      ad.images.forEach(imgPath => {
        const filePath = path.join(__dirname, "..", imgPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      // Nayi images ke paths set karo
      updatedImages = req.files.map(file => `/uploads/advertisements/${file.filename}`);
    }

    // Update fields
    ad.imageType = req.body.imageType ? req.body.imageType.toUpperCase() : ad.imageType;
    ad.images = updatedImages;

    await ad.save();

    res.status(200).json({
      success: true,
      message: "Advertisement updated successfully",
      data: ad,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};