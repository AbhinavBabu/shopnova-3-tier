const express = require("express");
const router = express.Router();
const { sendNotification } = require("../controllers/notificationController");

// POST /notify
router.post("/", sendNotification);

module.exports = router;
