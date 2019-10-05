const express = require('express');

const router = express.Router();

const messageController = require('../controllers/messages');




//FIND ALL MESSAGES FOR THE ADMIN
router.get('/', messageController.getMessages)


router.get('/:userId', messageController.getMessagesUserAsUser)

router.post('/admin-update/:userId', messageController.getMessagesUserAsAdmin)



router.post('/:userId', messageController.getMessagesUserAsUserAndUpdate)

router.post('/user/:userId', messageController.postMessagesUser)

router.post('/admin/:userId', messageController.postMessagesAdmin)

module.exports = router;