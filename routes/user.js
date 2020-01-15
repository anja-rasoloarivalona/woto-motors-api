const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')


router.get('/favorites/:userId', userController.getFavoriteProducts)

router.post('/add-favorite/:userId', userController.addFavorite)

router.post('/remove-favorite/:userId', userController.removeFavorite)

router.post('/edit/:userId', userController.editUserInfos)

module.exports = router;