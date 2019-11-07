const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')


router.get('/favorites/:userId', userController.getFavoriteProducts)

router.post('/add-favorite/:userId', userController.addFavorite)

router.post('/remove-favorite/:userId', userController.removeFavorite)

module.exports = router;