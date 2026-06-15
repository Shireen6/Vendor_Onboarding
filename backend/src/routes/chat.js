const express = require('express')
const { sendMessage, getHistory } = require('../controllers/chatController')
const { protect } = require('../middleware/auth')

const router = express.Router()

router.use(protect)

router.post('/message', sendMessage)
router.get('/history', getHistory)

module.exports = router
