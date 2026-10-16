const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imgAdController = require('../controllers/imgAdvertisementController');
const verifyLogin = require('../middleware/verifyLogin');

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/advertisements');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', imgAdController.getImgAdvertisements);
router.post('/', verifyLogin, upload.array('images', 10), imgAdController.uploadImgAdvertisement);
router.delete('/:id', verifyLogin, imgAdController.deleteImgAdvertisement);
// Put route for updating advertisement
router.put('/:id', verifyLogin, upload.array('images', 10), imgAdController.updateImgAdvertisement);

module.exports = router;