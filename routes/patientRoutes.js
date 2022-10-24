const express = require('express');
const router = express.Router();
const {addPatient,patientList,updatePatient} = require('../controllers/patientController');
const {auth} = require('../middlewares/auth');
const {upload} = require('../config/utils');


// Routes

router.post('/api/addPatient',auth, addPatient);
router.post('/api/patientList',auth, patientList);
router.post('/api/updatePatient',auth, updatePatient);


module.exports = router;