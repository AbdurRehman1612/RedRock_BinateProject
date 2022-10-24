const multer = require('multer');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// Email function
const transporter = nodemailer.createTransport({
    service: 'appsstaging',
    host: 'server.appsstaging.com',
    port: 465,
    secure: true,
    auth: {
      user: 'noreply@server.appsstaging.com',
      pass: 'Technado@1234'
    }
  });

const sendEmail = (email,verificationCode) => {

    const mailOptions =  {
        from: 'dev.appsnado@gmail.com', // sender address
        to:   email,  // list of receivers
        subject: 'Subject of your email', // Subject line
        html: `<p>Your Verification Code is ${verificationCode} </p>`,// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info);
    });
}


const sendEmailViaPassword = (email,verificationCode) => {

    const mailOptions =  {
        from: 'dev.appsnado@gmail.com', // sender address
        to:   email,  // list of receivers
        subject: 'Subject of your email', // Subject line
        html: `<p>Your Password is ${verificationCode} </p> <br> <a href="https://play.google.com/store/apps">Install App</a>`,// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err)
        else
            console.log(info);
    });
}


const storage = multer.diskStorage({    
    destination: function(req, file, cb){ 
        
       
        if(file.fieldname == 'user_image'){
            cb(null, './uploads/profile/');
        }
        if(file.fieldname == 'product_images[]'){
            cb(null, './uploads/product/');
        }
        
    },
    filename: function(req, file, cb){
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

function fileFilter (req, file, cb) {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 
    },
    fileFilter: fileFilter
});


const generateToken = (user) => {
     return jwt.sign({
         _id: user._id,
         name: user.name,
         email: user.email         
     },process.env.JWT_SECRET, {
         expiresIn: '30d'
     })   
}

const createToken = (user) => {
    return jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: '7d'});
 }

module.exports = {generateToken, createToken, sendEmail, upload, sendEmailViaPassword}