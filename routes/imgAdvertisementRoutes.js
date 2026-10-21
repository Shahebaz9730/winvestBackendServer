const express = require('express');
const router = express.Router();
const multer = require('multer');
const imgAdController = require('../controllers/imgAdvertisementController');
const verifyLogin = require('../middleware/verifyLogin');

// 🌟 Multer Memory Storage (Files will not be saved to disk, kept in buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per image
});

// Routes
router.get('/', imgAdController.getImgAdvertisements);
router.post('/', verifyLogin, upload.array('images', 10), imgAdController.uploadImgAdvertisement);
router.put('/:id', verifyLogin, upload.array('images', 10), imgAdController.updateImgAdvertisement);
router.delete('/:id', verifyLogin, imgAdController.deleteImgAdvertisement);

module.exports = router;