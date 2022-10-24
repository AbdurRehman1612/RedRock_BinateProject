const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const jwt       = require('jsonwebtoken');

const userSchema = mongoose.Schema({   
    user_fname:{
        type: String,
        required: false,
        trim: true,
        default: null
     },
    user_lname:{
        type: String,
        required: false,
        trim: true,
        default: null
     },
     user_email:{
        type: String,
        required: false,
        trim: true,
        default: null
     },
     user_password:{
        type: String,
        required: false,
        trim: true,
        default: null
     },     
     admin_approved:{
        type: Number,
        required: false,
        trim: true,
        default: 0
     },
   //   hospital_id: {
   //      type: mongoose.Schema.Types.ObjectId,
   //      required: false,
   //      ref: 'Hospital',
   //      default: null
   //      },        
   agency_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Admin',
        default: null
     },
     branch_id:{
    //   type: mongoose.Schema.Types.ObjectId,
    type:String,
      required: false,
    //   ref: 'HospitalBranch',
      default: null
   },
     user_phone:{
        type: String,
        required: false,
        trim: true,
        default: null
     },
     user_verification_code:{
        type: Number,
        required: false,
        trim: true,
        default: null
     },
     user_is_verified:{
        type: Number,
        default: 0,
        trim: true,
    },
    user_is_profile_complete:{
        type: Number,
        default: 0,
        trim: true,
    },
    is_notification:{
        type: Number,
        default: 0,
        trim: true,
    },
    is_blocked:{
        type: Number,
        default: 0,
        trim: true,
    },
    user_authentication:{           
        type: String,
        required: false,
        default: null,
        },  
    user_image:{           
        type: String,
        required: false,
        default: null,
        },    
    user_type: {
        type: String,
        enum: ['nurse'],
        default: 'nurse'
    },
    user_device_type:{
        type: String,
        required: false,
        trim: true,
        default: null
    },
    user_device_token:{
        type: String,
        required: false,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});


// Hospital Schema
const hospitalSchema  = new mongoose.Schema({       
    hospital_name: {
       type: String,
       default: null,
       trim: true,
    },    
    is_blocked:{
     type: Number,
     default: 0,
     trim: true,
    },
}, {
   timestamps: true
});


// Hospital Branch Schema
const hospitalBranchSchema  = new mongoose.Schema({  
   hospital_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hospital',
      default: null
      },     
    branch_name: {
       type: String,
       default: null,
       trim: true,
    },    
    is_blocked:{
     type: Number,
     default: 0,
     trim: true,
    },
}, {
   timestamps: true
});


// Patient Schema
const patientSchema  = new mongoose.Schema({
    
    user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'user'
    },          
    patient_fname: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_lname: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_phone: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_dob: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_gender: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_liter_flow: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_height_feet: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_height_inches: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_weight: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_address: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_address2: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_city: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_country: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_state: {
       type: String,
       default: null,
       trim: true,
    },    
    patient_zipcode: {
       type: String,
       default: null,
       trim: true,
    },    
    is_blocked:{
     type: Number,
     default: 0,
     trim: true,
    },
}, {
   timestamps: true
});

// notification Schema here
const notificationSchema  = new mongoose.Schema({ 
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
      },       
   order_number: {
      type: String,
      default: null,
      trim: true,
   },    
   message: {
      type: String,
      default: null,
      trim: true,
   },    
   is_blocked:{
    type: Number,
    default: 0,
    trim: true,
   },
}, {
  timestamps: true
});
                                                                                                                                           
const adminSchema = new mongoose.Schema({
   name: {
       type: String,
       require: true,
       minlength: 3
   },
   email: {
      type: String,
      require: true,
      
  },
  user_image:{           
   type: String,
   required: false,
   default: null,
   }, 
  password: {
      type: String,
      require: true,
      minlength: 6
  },  
  hospital_name: {
      type: String,
    },
    agencyDescription: {
      type: String,
    },    
  isAdmin:{
      type: Boolean,
      require: true,
      default: false
  },
  is_blocked:{
   type: Number,
   default: 0,
   trim: true,
  },
},
  {timestamps:true}
);


// Here Hiding some data
userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.user_password;
   // delete userObject.user_authentication;
    
    return userObject;
}

// Here generate Auth Token
userSchema.methods.generateAuthToken = async function(){
   
    const user = this;  
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
    user.user_authentication = token;    
    await user.save();
    return token;
}

// Hash Password save before  saving
userSchema.pre('save', async function (next) {
    const user = this;  
    if(user.isModified('user_password')){
        user.user_password = await bcrypt.hash(user.user_password, 8);
    }   
    next();
});

// For admin password
adminSchema.pre('save', async function (next) {

   const Admin = this;
   
   if(Admin.isModified('password')){
     Admin.password = await bcrypt.hash(Admin.password, 8);
   }
   next();
});



const User              = mongoose.model('user', userSchema);
const Hospital          = mongoose.model('Hospital', hospitalSchema);
const HospitalBranch    = mongoose.model('HospitalBranch', hospitalBranchSchema);
const Patient           = mongoose.model('Patient', patientSchema);
const Notification      = mongoose.model('Notification', notificationSchema);
const Admin             = mongoose.model('Admin', adminSchema);

module.exports = {User, Hospital, HospitalBranch, Patient, Notification, Admin};