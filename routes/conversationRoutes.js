const express = require("express");
const router = express.Router();
const {
  saveConversation,
  getConversation,
  getUsers,
  createChatConversation,
} = require("../controllers/conversationController");

router.post("/api/saveConversation", saveConversation);
router.get("/api/getConversation", getConversation);
router.get("/api/getUsers", getUsers);
router.get(
  "/api/createChatConversation/:firstUserId/:secondUserId",
  createChatConversation
);

module.exports = router;
