const ImgAdvertisement = require("../models/ImgAdvertisement");

// 1. Upload Multiple Images (Converted to Base64 and stored in MongoDB)
exports.uploadImgAdvertisement = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload at least one image" });
    }

    // Har uploaded file ke buffer ko Base64 data URL me convert karlo
    const base64Images = req.files.map(file => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      return `data:${file.mimetype};base64,${b64}`;
    });

    const newAd = await ImgAdvertisement.create({
      imageType: req.body.imageType ? req.body.imageType.toUpperCase() : "BIG_SQUARE",
      images: base64Images,
    });

    res.status(201).json({
      success: true,
      message: "Advertisements uploaded successfully to database",
      data: newAd,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get All Advertisements (Optional filter)
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

// 3. Delete Advertisement from Database
exports.deleteImgAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await ImgAdvertisement.findById(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    await ImgAdvertisement.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Update Advertisement
exports.updateImgAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await ImgAdvertisement.findById(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: "Advertisement not found" });
    }

    let updatedImages = ad.images;

    // Agar nayi files aayi hain toh unhe base64 me convert karke update karo
    if (req.files && req.files.length > 0) {
      updatedImages = req.files.map(file => {
        const b64 = Buffer.from(file.buffer).toString("base64");
        return `data:${file.mimetype};base64,${b64}`;
      });
    }

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