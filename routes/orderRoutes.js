const express = require("express");
const router = express.Router();
const {
  addOrder,
  orderList,
  patientOrderList,
  pickUpRequest,
  checkOrder,
  patientOrderListInProcess,
  notificationList,
} = require("../controllers/orderController");
const {
  getAllOrders,
  getAgencyOrders,
  isDelivered,
  orderAllListAdmin,
  updateOrderItemStatusAdmin,
  updateOrderStatusAdmin,
  orderCancel,
  isReadOrder,
} = require("../controllers/admin/orderController");

const { auth } = require("../middlewares/auth");

// Routes

router.post("/api/addOrder", auth, addOrder);
router.post("/api/orderList", orderList);
router.post("/api/patientOrderList", auth, patientOrderList);
router.post("/api/pickUpRequest", auth, pickUpRequest);
router.post("/api/checkOrder", auth, checkOrder);
router.post("/api/patientOrderListInProcess", auth, patientOrderListInProcess);
router.post("/api/notificationList", auth, notificationList);

// Here is Admin Routes
router.get("/api/getAllOrders", getAllOrders);
router.post("/api/isreadorder", isReadOrder);
router.post("/api/isdelivered", isDelivered);
router.get("/api/getAgencyOrders", getAgencyOrders);
router.get("/api/getOrderDetails/:order_id", orderAllListAdmin);
router.post("/api/itemStatusUpdate", updateOrderItemStatusAdmin);
router.get("/api/updateOrderStatusAdmin/:order_id", updateOrderStatusAdmin);
router.get("/api/orderCancel/:order_id", orderCancel);

module.exports = router;
