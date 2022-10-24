const express = require('express');
const router = express.Router();
const { addHospital, addHospitalBranch, hospitalList, signUp, user_verification, resendCode, completeProfile, userLogin, userLogout, userForgotPassword,
  userPasswordUpdate, socialLogin, changePassword, content, addHelpAndFeedback, deleteNurse, msg } = require('../controllers/userController');
const { loginVlidation, signIn, userList, getAllAgency,getAllAgencyBranches, getAllBranches, AgencyVlidation,getAllBranchesAgency,
  AddAgency, agencyEdit, branchEdit, deletBranche, deletAgency, isAuthenticatedUser, adminApproval, BranchVlidation, AddNurseVlidation, BranchAgency, getDashboardData,
  passwordChange, pushNoti,
  isAuthenticatedUserNurse,
  branchListByAgencyId,
  nurseListByBranchID,
  patientListByNurseID,
  patientList,
  orderListByNurseID,
  NursesListByBranchID,
  getAgencyDashboardData,
  nurseListByAgency,
  AddNurse,
  newpatient
} = require('../controllers/admin/adminController');
const { getContent, updateContent, updateContentTc } = require('../controllers/admin/contentController');
const { auth } = require('../middlewares/auth');
const { upload } = require('../config/utils');


// Routes

router.post('/api/addHospital', addHospital);
router.post('/api/addBranch', addHospitalBranch);
router.post('/api/hospitalList', auth, hospitalList);
router.post('/api/signup', signUp);
router.post('/api/user_verification', user_verification);
router.post('/api/re_send_code', resendCode);
router.post('/api/complete_profile', upload.single('user_image'), auth, completeProfile);
router.post('/api/user_login', userLogin);
router.post('/api/logout', auth, userLogout);
router.post('/api/changePassword', auth, changePassword);
router.post('/api/forgot_password', userForgotPassword);
router.post('/api/update_password', userPasswordUpdate);
router.post('/api/deleteNurse', auth, deleteNurse);
router.post('/api/social_login', socialLogin);
//router.post('/api/content', content);
router.post('/api/helpFeedback', auth, addHelpAndFeedback);

// Here is Admin panel Routes
router.post('/api/signIn', loginVlidation, signIn);
router.get('/api/userList/:user_id', userList);
// router.get('/api/agencyList', getAllAgency);
router.get('/api/agencyList/:user_id', getAllAgency);
router.get('/api/getagencybranches', getAllAgencyBranches);
// router.get('/api/getAllBranches', getAllBranches);
router.get('/api/getAllBranches/:agencyId', getAllBranches);
router.get('/api/getAllBranchesAgency/:agencyId', getAllBranchesAgency);
router.get('/api/agencyEdit/:agency_id', agencyEdit);
router.post('/api/AddAgency', AgencyVlidation, AddAgency);
router.post('/api/BranchAgency', BranchVlidation, BranchAgency);
router.post('/api/NurseAdd', AddNurseVlidation, AddNurse);
router.get('/api/branchEditData/:branch_id', branchEdit);
router.post('/api/deletBranche/:branch_id', deletBranche);
router.post('/api/deletAgency/:agency_id', deletAgency);
router.get('/api/adminApproval/:user_id', adminApproval);

router.get('/api/content/:content_type?', getContent);
router.post('/api/updateContent', updateContent);
router.post('/api/updateContentTc', updateContentTc);
router.get('/api/dashboard', getDashboardData);
router.get('/api/agencydashboard', getAgencyDashboardData);
router.post('/api/passwordChange', passwordChange);
// verify token
router.get("/api/verify-token", isAuthenticatedUser, (req, res) => {
  res.status(200).send({ status: "success", message: "token is valid" });
});
router.get("/api/verify-token-nurse", isAuthenticatedUserNurse, (req, res) => {
  res.status(200).send({ status: "success", message: "token is valid" });
});

router.get('/api/test', pushNoti);


router.get('/api/branchListByAgencyId/:agencyId', branchListByAgencyId);
router.get('/api/nurseListsByAgencyId/:branchId', nurseListByBranchID);
router.get('/api/nurseListsByAgency/:Id', nurseListByAgency);
router.get('/api/patientByNursesId/:nurseId', patientListByNurseID);
router.get('/api/patientlists', patientList);
router.get('/api/orderByNursesId/:nurseId', orderListByNurseID);
router.get('/api/patientnewlist/:id', newpatient);
router.get('/api/branchnurses/:branchId', NursesListByBranchID);




//router.get('/',msg);

module.exports = router;