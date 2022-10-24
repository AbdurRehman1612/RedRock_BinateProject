const express = require("express");
const router = express.Router();
const {
  saveMessage,
  getMessage,
  getUnReadMessage,
  getPatientList,
  adminInfo,
  getMessageAdmin,
  saveMessageAdmin,
  getDetails,
  getBranches,
  getnursepatients,
  getfilter1,
  getfilter2,
  getfilter3,
} = require("../controllers/messageController");
const { auth } = require("../middlewares/auth");

router.post("/api/saveMessage",saveMessage);
router.post("/api/getMessage/", auth, getMessage);
router.get("/api/getUnReadMessage/:conversationId", getUnReadMessage);
router.post("/api/getPatientList", auth, getPatientList);
router.post("/api/adminInfo", auth, adminInfo);

// For Admin Routes
router.get("/api/getMessageAdmin", getMessageAdmin);
router.post("/api/saveMessageAdmin", saveMessageAdmin);

router.get("/api/getdetails", getDetails);
router.get("/api/getbranches", getBranches);
router.get("/api/getfilter1", getfilter1);
router.get("/api/getfilter2", getfilter2);
router.get("/api/getfilter3", getfilter3);
router.get("/api/getnursepatients", getnursepatients);

module.exports = router;
