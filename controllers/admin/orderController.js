const { Order } = require("../../models/OrderModel");
const push_notification = require("../../config/push_notification");
const { User, Notification } = require("../../models/User");

// Order List
const getAllOrders = async (req, res) => {
  // const p_fname = [];

  try {
    const getAllOrders = await Order.find({ is_blocked: 0 })
      .populate("patient_id").populate("nurse_id")
      .select(
        "order_title order_number order_details order_delivery_date _id order_status is_read agency_id patient_id nurse_id"
      )
      .sort({ _id: -1 });

    if (getAllOrders) {
      return res.status(200).json({ getAllOrders });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

const isReadOrder = async (req, res) => {
  var list = [];
  console.log(req.body.id);
  try {
    const getisread = await Order.find({ _id: req.body.id });

    getisread.map((ir) => {
      list.push(ir.is_read);
    });
    console.log("list", list);
    if (list.includes(0)) {
      const update = await Order.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            is_read: 1,
          },
        },
        {
          new: true,
        }
      );
      console.log("first", update);
    }
    return res.status(200).json({ status: 1 });
  } catch (error) {
    return res.send(error.message);
  }
};
const isDelivered = async (req, res) => {
  const check = [];
  var list = [];
  console.log(req.body.id);
  try {
    const getOrderItems = await Order.find({ _id: req.body.id });

    getOrderItems.map((oi) => {
      list.push(oi.orderItems);
    });
    console.log("list", list[0]);
    // for (i = 0; i < list[0].length; i++) {
    list[0].map((m) => {
      check.push(m.product_status);
    });
    // }
    console.log("check", check);
    if (check.every((val) => val === "delivered")) {
      const update = await Order.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            order_status: "delivered",
          },
        },
        {
          new: true,
        }
      );
      const findUser = await User.findOne({ _id: update.nurse_id });

      const notification_obj = {
        user_device_token: findUser.user_device_token,
        sender_text: "Order Stutus " + update.order_number,
        heading: "Your Order has been delivered.",
      };
      push_notification(notification_obj);
      const NotiSave = new Notification({
        user_id: update.nurse_id,
        order_number: update.order_number,
        message: "Your Order has been delivered.",
      });
      await NotiSave.save();
      console.log("Status Update Successfully to re-open.");
      return res.status(200).json({ msg: "Status Update Successfully." });
      
    } else {
      const update = await Order.findByIdAndUpdate(
        { _id: req.body.id },
        {
          $set: {
            order_status: "in_process",
          },
        },
        {
          new: true,
        }
      );
    }
  } catch (error) {
    return res.send(error.message);
  }
};
// const isDelivered = async (req, res) => {
//   const check = [];
//   var list = [];
//   console.log(req.body.id);
//   try {
//     const getOrderItems = await Order.find({ _id: req.body.id });

//     getOrderItems.map((oi) => {
//       list.push(oi.orderItems);
//     });
//     console.log("list", list[0]);
//     // for (i = 0; i < list[0].length; i++) {
//     list[0].map((m) => {
//       check.push(m.product_status);
//     });
//     // }
//     console.log("check", check);
//     if (check.every((val) => val === "delivered")) {
//       const update = await Order.findByIdAndUpdate(
//         { _id: req.body.id },
//         {
//           $set: {
//             order_status: "delivered",
//           },
//         },
//         {
//           new: true,
//         }
//       );
//       return res.status(200).json({ status: 1 });
//     } else {
//       const update = await Order.findByIdAndUpdate(
//         { _id: req.body.id },
//         {
//           $set: {
//             order_status: "in_process",
//           },
//         },
//         {
//           new: true,
//         }
//       );
//     }
//   } catch (error) {
//     return res.send(error.message);
//   }
// };
const getAgencyOrders = async (req, res) => {
  console.log("req.query.id :>> ", req.query.id);
  try {
    const getAgencyOrders = await Order.find({
      agency_id: req.query.id,
      is_blocked: 0,
    })
      .populate("patient_id").populate("nurse_id")
      .select(
        "order_title order_number order_details order_delivery_date _id order_status is_read agency_id patient_id nurse_id"
      )
      .sort({ _id: -1 });

    console.log("getAgencyOrders", getAgencyOrders);

    return res.status(200).json({ getAgencyOrders });
  } catch (error) {
    return res.send(error.message);
  }
};

// Order All List
const orderAllListAdmin = async (req, res) => {
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const getOrderDetails = await Order.findOne({
      _id: req.params.order_id,
    }).populate([
      {
        path: "nurse_id",
        populate: {
          path: "agency_id",
          model: "Admin",
        },
      },
      {
        path: "nurse_id",
        populate: {
          path: "branch_id",
          model: "HospitalBranch",
        },
      },
      {
        path: "patient_id",
        model: "Patient",
      },
    ]);
    if (getOrderDetails) {
      return res.status(200).json({ getOrderDetails });
    } else {
      return res.status(200).send({ status: 0, message: "No Order Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

const updateOrderItemStatusAdmin = async (req, res) => {
  try {
    const { item_id, SelectedStatus } = req.body;

    const itemStatus = await Order.findOneAndUpdate(
      { "orderItems._id": item_id },
      {
        $set: {
          "orderItems.$.product_status": SelectedStatus,
        },
      },
      {
        new: true,
      }
    );

    if (itemStatus) {
      const findUser = await User.findOne({ _id: itemStatus.nurse_id });

      const notification_obj = {
        user_device_token: findUser.user_device_token,
        sender_text: "Order Stutus " + itemStatus.order_number,
        heading: "Your Item Status has been changed " + SelectedStatus,
      };
      push_notification(notification_obj);

      return res.status(200).json({ msg: "Status Update Successfully." });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

const updateOrderStatusAdmin = async (req, res) => {
  const value = [];
  try {
    console.log("heyyyy.");
    const check = await Order.find({ _id: req.params.order_id });
    console.log("check", check);
    check.map((ch) => {
      value.push(ch.order_status);
    });
    console.log(value);
    if (value.includes("close")) {
      const isUpdated = await Order.findOneAndUpdate(
        { _id: req.params.order_id },
        { order_status: "in_process" }
      );
      const findUser = await User.findOne({ _id: isUpdated.nurse_id });

      const notification_obj = {
        user_device_token: findUser.user_device_token,
        sender_text: "Order Stutus " + isUpdated.order_number,
        heading: "Your Order has been Re-Opened.",
      };
      push_notification(notification_obj);
      const NotiSave = new Notification({
        user_id: isUpdated.nurse_id,
        order_number: isUpdated.order_number,
        message: "Your Order has been Re-Opened",
      });
      await NotiSave.save();
      console.log("Status Update Successfully to re-open.");
      return res.status(200).json({ msg: "Status Update Successfully." });
    } else {
      const isUpdated = await Order.findOneAndUpdate(
        { _id: req.params.order_id },
        { order_status: "close" }
      );
      const findUser = await User.findOne({ _id: isUpdated.nurse_id });

      const notification_obj = {
        user_device_token: findUser.user_device_token,
        sender_text: "Order Stutus " + isUpdated.order_number,
        heading: "Your Order has been Closed.",
      };
      push_notification(notification_obj);
      const NotiSave = new Notification({
        user_id: isUpdated.nurse_id,
        order_number: isUpdated.order_number,
        message: "Your Order has been Closed",
      });
      await NotiSave.save();
      console.log("Status Update Successfully to close.");
      return res.status(200).json({ msg: "Status Update Successfully." });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

// Cancel order
const orderCancel = async (req, res) => {
  const value = [];

  try {
    console.log("heyyyy.");
    const check = await Order.find({ _id: req.params.order_id });
    console.log("check", check);
    check.map((ch) => {
      value.push(ch.is_blocked);
    });
    if (value.includes(0)) {
      const delOrder = await Order.findByIdAndUpdate(
        { _id: req.params.order_id },
        { is_blocked: 1 }
      );

      return res
        .status(200)
        .json({ msg: "Order has been Successfully Canceled!" });
    } else {
      const delOrder = await Order.findByIdAndUpdate(
        { _id: req.params.order_id },
        { is_blocked: 0 }
      );

      return res
        .status(200)
        .json({ msg: "Order has been Successfully Uncanceled!" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// Pateint Order List
const patientorderListAdminAdmin = async (req, res) => {
  try {
    if (!req.body.patient_id) {
      return res
        .status(400)
        .send({ status: 0, message: "Patient field is required" });
    } else {
      const getOrder = await Order.find({
        is_blocked: 0,
        patient_id: req.body.patient_id,
      }).sort({ _id: -1 });
      if (getOrder) {
        return res
          .status(200)
          .send({ status: 1, message: "Success", data: getOrder });
      } else {
        return res.status(200).send({ status: 0, message: "No Order Found!" });
      }
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

// Pateint Order List In process
const patientorderListAdminAdminInProcessAdmin = async (req, res) => {
  try {
    if (!req.body.patient_id) {
      return res
        .status(400)
        .send({ status: 0, message: "Patient field is required" });
    } else {
      const getOrder = await Order.find({
        is_blocked: 0,
        order_status: "in_process",
        patient_id: req.body.patient_id,
      }).sort({ _id: -1 });
      if (getOrder) {
        return res
          .status(200)
          .send({ status: 1, message: "Success", data: getOrder });
      } else {
        return res.status(200).send({ status: 0, message: "No Order Found!" });
      }
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

module.exports = {
  getAllOrders,
  getAgencyOrders,
  patientorderListAdminAdmin,
  patientorderListAdminAdminInProcessAdmin,
  orderAllListAdmin,
  updateOrderStatusAdmin,
  updateOrderItemStatusAdmin,
  orderCancel,
  isReadOrder,
  isDelivered,
};
