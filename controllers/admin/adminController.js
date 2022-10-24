const bcrypt = require("bcrypt");
const { sendEmailViaPassword, createToken } = require("../../config/utils");
const { Admin, User, HospitalBranch, Patient } = require("../../models/User");
const { Order } = require("../../models/OrderModel");
const { body, validationResult, cookie } = require("express-validator");
const jwt = require("jsonwebtoken");

const FCM = require("fcm-node");
const serverKey =
  "AAAABRBNBtY:APA91bHR_is6D5WVTKcSXsSqGUcOS-VnL0HvLlr0ymHmGR3rHhxL-_FEaalvMVX0RQGJ3uQUXHds8t2rqlIJxVeDlIYaA7tqtZaKkNuSg7uowQ_yY9Tnp6d9s8hyIGU4GCKvdaovvPqU"; //put your server key here
const fcm = new FCM(serverKey);

// verify token
const isAuthenticatedUser = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(400).send("authorization token missing");
  }
  var token = req.headers.authorization.split(" ")[1];
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      const { user } = decoded;
      Admin.findOne({ _id: user._id })
        .then((usr) => {
          //console.log(usr);
          req.user = usr;
          next();
        })
        .catch((err) => {
          console.log(err, "error");
          return res.status(400).send(err);
        });
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
// verify token
const isAuthenticatedUserNurse = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(400).send("authorization token missing");
  }
  var token = req.headers.authorization.split(" ")[1];
  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      //console.log(decoded);
      //const { user } = decoded;
      User.findOne({ _id: decoded._id })
        .then((usr) => {
          //console.log(usr);
          req.user = usr;
          next();
        })
        .catch((err) => {
          console.log(err, "error");
          return res.status(400).send(err);
        });
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// Login Validation
const loginVlidation = [
  body("email").not().isEmpty().trim().withMessage("Email is required!"),
  body("password").not().isEmpty().trim().withMessage("Password is required!"),
];

// User login
const signIn = async (req, res) => {
  // console.log(req.body);
  // return;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  const { email, password } = req.body;
  try {
      const Email=email.toLowerCase()
    const user = await Admin.findOne({ email:Email });
    if (user) {
      const matched = await bcrypt.compare(password, user.password);
      if (matched) {
        //const userPermission = await RolePermission.find({designation_id: user.designation_id});
        //await Admin.updateOne({ email: user.email }, { is_online: 1 });
        const token = createToken(user);
        const userJson = user.toJSON();
        delete userJson["password"];
        return res
          .status(200)
          .json({ msg: "Login successfully", token, userJson });
      } else {
        return res
          .status(404)
          .json({ error: [{ msg: "Password not match!" }] });
      }
    } else {
      return res.status(404).json({ error: [{ msg: "Email not found!" }] });
    }
  } catch (error) {
    return res.status(500).json({ errors: error });
  }
};

// Get User list
const userList = async (req, res) => {
  try {
    // const adminIS = await Admin.findOne({ _id: req.params.user_id }, { isAdmin: false, is_blocked: 0 });

    // const adminIS = await Admin.find({ _id: req.params.user_id });

    // if (adminIS) {
    if (req.params.user_id == "60b4956e6031f3174c0075f1") {
      const users = await User.find({ is_blocked: 0 }).sort({ _id: -1 });

      return res.status(200).send(users);
    } else {
      // const users = await User.find({ 'agency_id': req.params.user_id }).sort({ _id: -1 });
      const users = await User.find({ agency_id: req.params.user_id }).sort({
        _id: -1,
      });

      return res.status(200).send(users);
    }
  } catch (error) {
    res.send(error.message);
  }
};

// Admin Approval
const adminApproval = async (req, res) => {
  try {
    const adminApp = await User.findByIdAndUpdate(
      { _id: req.params.user_id },
      { admin_approved: 1 }
    );
    if (adminApp) {
      return res.status(200).json({ msg: "Admin Approved Successfully!" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// Agency Edit
const agencyEdit = async (req, res) => {
  try {
    const agencyEdit = await Admin.findOne({ _id: req.params.agency_id });
    if (agencyEdit) {
      return res.status(200).json({ agencyEdit });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

// Branch Edit
const branchEdit = async (req, res) => {
  try {
    const branchEdit = await HospitalBranch.findOne({
      _id: req.params.branch_id,
    });
    if (branchEdit) {
      return res.status(200).json({ branchEdit });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

const getAllAgencyBranches = async (req, res) => {
  // const list=[]
  try {
    const { agencyId } = req.query;
    console.log(agencyId);

    const data = await HospitalBranch.find({ hospital_id: agencyId });

    // data.map((dt)=>{
    //   list.push(dt._id)
    //   list.push(dt.branch_name)
    // })

    return res.status(200).json({ data: data });
  } catch (error) {
    return res.send(error.message);
  }
};

// Get All Event list
const getAllAgency = async (req, res) => {
  // console.log("req.params.user_id:", req.params.user_id);

  try {
    if (req.params.user_id == "60b4956e6031f3174c0075f1") {
      // const users = await User.find({ is_blocked: 0 }).sort({ _id: -1 });
      const agencyList = await Admin.find(
        { isAdmin: false, is_blocked: 0 },
        { hospital_name: 1, email: 1 }
      );
      // console.log("agencyList for admin:", agencyList);
      return res.status(200).send({ agencyList });
      // return res.status(200).send(agencyList);
    } else {
      // const users = await User.find({ 'agency_id': req.params.user_id }).sort({ _id: -1 });
      // const users = await User.find({ agency_id: req.params.user_id }).sort({ _id: -1 });
      const agencyList = await Admin.find(
        { _id: req.params.user_id },
        { isAdmin: false, is_blocked: 0 },
        { hospital_name: 1, email: 1 }
      );
      // const agencyList = await Admin.find({ _id: req.params.user_id });
      console.log("agencyList_for_single_user:", agencyList);
      return res.status(200).send({ agencyList });
      // return res.status(200).send(agencyList);

      // if (agencyList) {
      //   return res.status(200).send({
      //     status: 200,
      //     // message: " you have find list of Chats Successfully.",
      //     agencyList: agencyList,
      //   });
      // }
    }
  } catch (error) {
    return res.send(error.message);
  }

  // try {
  //   const agencyList = await Admin.find({ isAdmin: false, is_blocked: 0 }, { hospital_name: 1, email: 1 });
  //   if (agencyList) {
  //     return res.status(200).json({ agencyList });
  //   }
  // } catch (error) {
  //   return res.send(error.message);
  // }
};

const AgencyVlidation = [
  body("hospital_name")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Agency Name Title is required!"),
  body("email").not().isEmpty().trim().withMessage("Email  is required!"),
  body("password").not().isEmpty().trim().withMessage("Password  is required!"),
];

// Here Save Agency API
const AddAgency = async (req, res) => {
  if (req.body.id == "") {
    try {
      validationResult(req).throw();

      try {
        const agencyFind = await Admin.findOne({ email: req.body.email });
        if (agencyFind) {
          return res
            .status(200)
            .json({ status: 0, msg: "This email already exist." });
        } else {
          const newUser = new Admin();

          (newUser.hospital_name = req.body.hospital_name),
            (newUser.email = req.body.email.toLowerCase()),
            (newUser.agencyDescription = req.body.agencyDescription),
            (newUser.password = req.body.password),
            await newUser.save();
          return res.status(200).json({ msg: "Saved Successfully!" });
        }
      } catch (error) {
        return res.status(500).json({ errors: error });
      }
    } catch (err) {
      return res.status(400).json({ error: err.mapped() });
    }
  } else {
    const updateRecord = await Admin.updateOne(
      { _id: req.body.id },
      {
        hospital_name: req.body.hospital_name,
        email: req.body.email,
        agencyDescription: req.body.agencyDescription,
      }
    );
    if (updateRecord) {
      return res.status(200).json({ msg: "Update Successfully!" });
    }
  }
};

// Get All Event list
const getAllBranches = async (req, res) => {
  console.log("req.params.agencyId:", req.params.agencyId);
  try {
    // const branchesList = await HospitalBranch.find({ is_blocked: 0 }, { branch_name: 1, hospital_id: 1 });
    const branchesList = await HospitalBranch.find({});
    if (branchesList) {
      return res.status(200).json({ branchesList });
    }
  } catch (error) {
    res.send(error.message);
  }
};
const getAllBranchesAgency = async (req, res) => {
  console.log("req.params.IDDDD:", req.params.agencyId);
  try {
    // const branchesList = await HospitalBranch.find({ is_blocked: 0 }, { branch_name: 1, hospital_id: 1 });
    const branchesList = await HospitalBranch.find({
      hospital_id: req.params.agencyId,
    });

    console.log("branchesList", branchesList);
    return res.status(200).json({ branchesList });
  } catch (error) {
    res.send(error.message);
  }
};

const BranchVlidation = [
  body("hospital_id")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Agency Name  is required!"),
  body("branch_name")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Branch Name is required!"),
];
const AddNurseVlidation = [
  body("user_fname")
    .not()
    .isEmpty()
    .trim()
    .withMessage("First Name  is required!"),
  body("user_lname")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Last Name  is required!"),
  body("user_email").not().isEmpty().trim().withMessage("Email  is required!"),
  body("user_password")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Password  is required!"),
  body("user_retypepassword")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Re-type Password  is required!"),
  body("user_phone")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Contact Number is required!"),
  body("branch_id")
    .not()
    .isEmpty()
    .trim()
    .withMessage("Please select a branch!"),
];

// Here Save Banch
const BranchAgency = async (req, res) => {
  if (req.body.id == "") {
    try {
      validationResult(req).throw();

      try {
        if (req.body.id == "") {
          const newUser = new HospitalBranch();

          (newUser.hospital_id = req.body.hospital_id),
            (newUser.branch_name = req.body.branch_name),
            await newUser.save();
          return res.status(200).json({ msg: "Saved Successfully!" });
        }
      } catch (error) {
        return res.status(500).json({ errors: error });
      }
    } catch (err) {
      return res.status(400).json({ error: err.mapped() });
    }
  } else {
    const updateRecord = await HospitalBranch.updateOne(
      { _id: req.body.id },
      { hospital_id: req.body.hospital_id, branch_name: req.body.branch_name }
    );
    if (updateRecord) {
      return res.status(200).json({ msg: "Update Successfully!" });
    }
  }
};

const AddNurse = async (req, res) => {
  const user = new User(req.body);
  try {
    if (!req.body.user_email) {
      return res
        .status(400)
        .send({ status: 0, message: "User Email field is required" });
    } else if (!req.body.user_password) {
      return res
        .status(400)
        .send({ status: 0, message: "User Password field is required" });
    } else if (req.body.user_password !== req.body.user_retypepassword) {
      return res
        .status(400)
        .send({ status: 0, message: "Passwords does not match" });
    }
    //   else if (!req.body.user_device_type){
    //     return res.status(400).send({status: 0, message: 'User Device Type field is required'});
    // }
    // else if (!req.body.user_device_token){
    //     return res.status(400).send({status: 0, message: 'User Device Token field is required'});
    // }
    else {
      const userFind = await User.findOne({ user_email: req.body.user_email });
      if (userFind) {
        return res
          .status(200)
          .send({ status: 0, message: "This email already exist." });
      } else {
        //const verificationCode = Math.floor(100000 + Math.random() * 900000);
        // const verificationCode = '123456';
        // user.user_verification_code = verificationCode;

        const newUser = await user.save();
        //  sendEmail(user.user_email, verificationCode);
        if (newUser) {
          return res.status(200).send({
            status: 1,
            message: "Nurse Added Successfully.",
            data: newUser,
          });
        }
      }
      console.log("newUser", newUser);
    }
  } catch (err) {
    return res.send(err.message);
  }
};

// Delete Branch
const deletBranche = async (req, res) => {
  try {
    // const delBranch = await HospitalBranch.findByIdAndUpdate({ _id: req.params.branch_id }, { is_blocked: 1 });
    const delBranch = await HospitalBranch.deleteOne({
      _id: req.params.branch_id,
    });
    if (delBranch) {
      return res.status(200).json({ msg: "Delete Successfully!" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// Delete Agency
const deletAgency = async (req, res) => {
  try {
    const delAgency = await Admin.deleteOne(
      { _id: req.params.agency_id },
      { is_blocked: 1 }
    );
    if (delAgency) {
      await HospitalBranch.deleteMany(
        { hospital_id: req.params.agency_id },
        { is_blocked: 1 }
      );
      return res.status(200).json({ msg: "Delete Successfully!" });
    }
  } catch (error) {
    res.send(error.message);
  }
};

// Get Data For Dashbaord
const getDashboardData = async (req, res) => {
  try {
    const nurse = await User.find({ user_type: "nurse" }).countDocuments();
    const agencies = await Admin.find({ isAdmin: false }).countDocuments();
    const android = await User.find({
      user_device_type: "android",
    }).countDocuments();
    const ios = await User.find({ user_device_type: "ios" }).countDocuments();

    if (nurse) {
      return res.status(200).send({ nurse, agencies, android, ios });
    }
  } catch (error) {
    res.send(error.message);
  }
};
const getAgencyDashboardData = async (req, res) => {
  const { id } = req.query;
  console.log(id);
  try {
    const branches = await HospitalBranch.find({
      hospital_id: id,
    }).countDocuments();
    const nurse = await User.find({
      user_type: "nurse",
      agency_id: id,
    }).countDocuments();
    const android = await User.find({
      user_device_type: "android",
    }).countDocuments();
    const ios = await User.find({ user_device_type: "ios" }).countDocuments();

    console.log(branches);
    console.log(nurse);

    return res
      .status(200)
      .send({ branches: branches, nurse: nurse, android: android, ios: ios });
  } catch (error) {
    res.send(error.message);
  }
};

// Here is change pasword
const passwordChange = async (req, res) => {
  try {
    const checkEmail = await Admin.findOne({ email: req.body.user_email });

    if (checkEmail) {
      const newPassword = await bcrypt.hash("abc123", 8);
      await Admin.findOneAndUpdate(
        { _id: checkEmail._id },
        {
          password: newPassword,
        }
      );
      sendEmailViaPassword(req.body.user_email, "abc123");
      return res.status(200).json({ msg: "Email Send successfully" });
    } else {
      return res.status(404).json({ error: [{ msg: "Email not found!" }] });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

const pushNoti = async (req, res) => {
  try {
    var message = {
      //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: "d9nRzqPVSrONF7_Sium4dO:APA91bGsf455JLMB5Eh-HfLXPXW4EJCUtQJFl_xYEF0t-p-pD63zyEb9fwIsWWSc1emq8jfwZav8ouGQYvBtChzbndPzUmQWjIJ8GyD6qG8H_YvZMO_5ug5Ne1KM8r7DkEUUljV-Q_58",

      notification: {
        title: "Testing here",
        body: "Testing body",
      },
      data: {
        //you can send only notification or only data(or include both)
        my_key: "go to here",
        my_another_key: "my another value",
      },
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });

    return res.status(404).json("faizan here");
  } catch (error) {
    return res.send(error.message);
  }
};

// branch List by agency id
const branchListByAgencyId = async (req, res) => {
  // console.log("req.params.agencyId:", req.params.agencyId);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const branchListsByAgencyId = await HospitalBranch.find({
      hospital_id: req.params.agencyId,
    });
    // console.log("branchListsByAgencyId:", branchListsByAgencyId);
    if (branchListsByAgencyId) {
      return res.status(200).json({ branchListsByAgencyId });
    } else {
      return res
        .status(200)
        .send({ status: 0, message: "No Branch List Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

// branch List by agency id
const nurseListByBranchID = async (req, res) => {
  // console.log("req.params.branchId:", req.params.branchId);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const nurseListsByAgencyId = await User.find({
      branch_id: req.params.branchId,
    });
    // console.log("nurseListsByAgencyId:", nurseListsByAgencyId);
    if (nurseListsByAgencyId) {
      return res.status(200).json({ nurseListsByAgencyId });
    } else {
      return res
        .status(200)
        .send({ status: 0, message: "No Nurse List Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

const nurseListByAgency = async (req, res) => {
  console.log("req.params.Id:", req.params.id);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const nurseListsByAgency = await User.find({
      agency_id: req.params.Id,
    });
    // console.log("nurseListsByAgencyId:", nurseListsByAgencyId);
    if (nurseListsByAgency) {
      console.log("nurseListsByAgency", nurseListsByAgency);
      return res.status(200).json({ nurseListsByAgency });
    } else {
      return res
        .status(200)
        .send({ status: 0, message: "No Nurse List Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

// branch List by nurse id
const patientListByNurseID = async (req, res) => {
  console.log("req.params.nurseId:", req.params.nurseId);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const patientListsByNurseId = await Patient.find({
      user_id: req.params.nurseId,
    });
    // console.log("patientListsByNurseId:", patientListsByNurseId);
    if (patientListsByNurseId) {
      return res.status(200).json({ patientListsByNurseId });
    } else {
      return res
        .status(200)
        .send({ status: 0, message: "No Patient List Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

// patientList
const patientList = async (req, res) => {
  // console.log("req.params.nurseId:", req.params.nurseId);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const patientList = await Patient.find({});
    // console.log("patientList:", patientList);
    if (patientList) {
      return res.status(200).json({ patientList });
    } else {
      return res
        .status(200)
        .send({ status: 0, message: "No Patient List Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

const newpatient = async (req, res) => {
  // console.log("req.params.nurseId:", req.params.nurseId);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const patientList = await User.aggregate([{ $match: {branch_id:req.params.id}},
                { "$lookup": {
                    "from": "patients",
                    "let": { "id": "$_id"},
                    "pipeline": [
                      { '$match':
                      { '$expr':
                        {
                           '$eq': ['$user_id', '$$id'],
                        }
                      }
                    } 
                    ],
                    "as": "patients"
                  }}
                ]);
    console.log("patientList:", patientList);
    if (patientList) {
      return res.status(200).json({ patientList });
    } else {
      return res
        .status(200)
        .send({ status: 0, message: "No Patient List Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

//  order List By Nurse ID
const orderListByNurseID = async (req, res) => {
  console.log("req.params.nurseId:", req.params.nurseId);
  try {
    // const orderListsByNurseId = await Order.find({ nurse_id: req.params.nurseId }, { is_blocked: 0 }).select('order_number _id order_status').sort({ nurse_id: -1 });
    // const orderListsByNurseId = await Order.find({ nurse_id: req.params.nurseId }, { is_blocked: 0 }).select('order_number _id order_status');
    const orderListsByNurseId = await Order.find({
      nurse_id: req.params.nurseId,
    })
      .populate("patient_id").populate("nurse_id")
      .select(
        "order_title order_number order_details order_delivery_date _id order_status agency_id is_read patient_id nurse_id"
      );
    console.log("orderListsByNurseId:", orderListsByNurseId);
    if (orderListsByNurseId) {
      return res.status(200).json({ orderListsByNurseId });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

const NursesListByBranchID = async (req, res) => {
  console.log("req.params.branchId:", req.params.branchId);
  try {
    // const orderListsByNurseId = await Order.find({ nurse_id: req.params.nurseId }, { is_blocked: 0 }).select('order_number _id order_status').sort({ nurse_id: -1 });
    // const orderListsByNurseId = await Order.find({ nurse_id: req.params.nurseId }, { is_blocked: 0 }).select('order_number _id order_status');
    const NursesByBranchID = await User.find({
      branch_id: req.params.branchId,
    })
      
    console.log("orderListsByNurseId:", NursesByBranchID);
    if (NursesByBranchID) {
      return res.status(200).json({ NursesByBranchID });
    }
  } catch (error) {
    return res.send(error.message);
  }
};

module.exports = {
  loginVlidation,
  signIn,
  userList,
  agencyEdit,
  branchEdit,
  deletBranche,
  deletAgency,
  getAllAgency,
  getAllAgencyBranches,
  AgencyVlidation,
  AddNurse,
  AddAgency,
  isAuthenticatedUser,
  getAllBranches,
  BranchVlidation,
  AddNurseVlidation,
  BranchAgency,
  getDashboardData,
  passwordChange,
  pushNoti,
  adminApproval,
  isAuthenticatedUserNurse,
  branchListByAgencyId,
//   orderListByBranchID,
  NursesListByBranchID,
  nurseListByBranchID,
  patientListByNurseID,
  patientList,
  orderListByNurseID,
  getAgencyDashboardData,
  getAllBranchesAgency,
  nurseListByAgency,
  newpatient
};
