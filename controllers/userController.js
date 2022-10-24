const bcrypt = require('bcrypt');
const {sendEmail} = require('../config/utils');
const {User,Hospital,HospitalBranch,HelpAndFeedback, Patient, Admin} = require('../models/User');
const {Content} = require('../models/ContentModel');
const fs = require('fs');
const { resourceUsage } = require('process');


// Add hospital

const addHospital = async (req, res) => {
    try{
            
         const hospital = new Hospital(req.body);

            const newHospital = await hospital.save();
             if(newHospital){
               return res.status(200).send({status: 1, message: 'Success', data: newHospital});
             }
         
    } catch (e) {
        return  res.status(400).send(e);
    }
 }

 const hospitalList = async (req, res) => {
    try{
          
             //const getList = await Hospital.find({hospital_name: { $regex: '.*' + req.body.hospital_name + '.*' } });
            // const getList = await HospitalBranch.find({is_blocked: 0},{branch_name:1})
            //                 .populate('hospital_id','hospital_name');

            const getList = await Admin.aggregate([
                { $match : { isAdmin : false } },
                  {                            
                    $lookup: {
                    from: 'hospitalbranches',
                    localField: '_id',
                    foreignField: 'hospital_id',
                    as: 'branches'
                  }
                },    
              
              ]);

             if(getList){
                return res.status(200).send({status: 1, message: 'Success', data:getList});
             }
         
    } catch (e) {
        return res.status(400).send(e);
    }
 }

 // Add Hospital Branch
const addHospitalBranch = async (req, res) => {
    try{
            
         const hosBranch = new HospitalBranch(req.body);

            const hosBranchAdd = await hosBranch.save();
             if(hosBranchAdd){
               return res.status(200).send({status: 1, message: 'Success', data:hosBranchAdd});
             }
         
    } catch (e) {
        return  res.status(400).send(e);
    }
 }



// User sign up
const signUp = async (req, res) => {
        const user = new User(req.body);     
    try{        
          if(!req.body.user_email){
            return res.status(400).send({status: 0, message: 'User Email field is required'});
            }          
          else if (!req.body.user_password){
            return res.status(400).send({status: 0, message: 'User Password field is required'});
          }          
          else if (!req.body.user_device_type){
            return res.status(400).send({status: 0, message: 'User Device Type field is required'});
        }
        else if (!req.body.user_device_token){
            return res.status(400).send({status: 0, message: 'User Device Token field is required'});
        }
          
          else{
              const userFind = await User.findOne({user_email:req.body.user_email});
              if(userFind){                
                return res.status(200).send({status: 0, message: 'This email already exist.'});
              }
              else{
                //const verificationCode = Math.floor(100000 + Math.random() * 900000);
                const verificationCode = '123456';
                user.user_verification_code = verificationCode;
                 
             const newUser = await user.save();
             sendEmail(user.user_email, verificationCode);
             if(newUser){
                return res.status(200).send({status: 1, message: 'User Sign Up Successfully.',data: newUser});
             }
            }
          }
                   
    }catch(err){
        return res.send(err.message);
    }
}


  const user_verification = async (req, res) => {
            
          try{                
             if (!req.body.user_verification_code){
                return res.status(400).send({status: 0, message: 'Verification Code field is required'})
              }
              else {
                
                  const userFind =  await User.findOne({_id: req.body.user_id, user_verification_code: req.body.user_verification_code});
                  if(userFind){
                        const updatedUser = await User.findOneAndUpdate({_id: req.body.user_id},{user_is_verified: 1, user_verification_code: null});                                                   
                        if(updatedUser){
                        const token = await userFind.generateAuthToken();   
                        const updatedUserFind =  await User.findOne({_id: req.body.user_id})                       
                            
                        return res.status(200).send({status: 1,message:'Successfully verified account', data: updatedUserFind})
                        }
                  }else {
                    return res.status(400).send({status: 0, message: 'No Record Found.'});
                  }

              }

        } catch (e) {
            return res.status(400).send(e);
        }
  }

  const resendCode = async (req, res) => {
    try{
        if(!req.body.user_id){
            return res.status(400).send({status: 0, message: 'User ID field is required'});
        }
        else{
            const userFind =  await User.findOne({_id: req.body.user_id});
            //  if(userFind.user_is_verified == 1){
            //     return res.status(400).send({status: 0, message: 'User Already Verified.',data:userFind});
            //  }
            //  else{
                if(userFind){
                    //const verificationCode = Math.floor(100000 + Math.random() * 900000);
                    const verificationCode = '123456';
                    await User.findOneAndUpdate({_id: req.body.user_id},{user_verification_code: verificationCode});                  
                     sendEmail(userFind.user_email, verificationCode);
                     return res.status(200).send({status: 1,message:'Verification Code Successfully Send.'})
                }else {
                    return res.status(400).send({status: 0, message: 'User Not Found.'});
                }
            // }            
            
        }

    } catch (e) {
        return res.status(400).send(e);
    }
 }

  const completeProfile = async (req, res) => {
    const userUpdate = new User(req.body);

      try{        
        if(!req.body.user_id){            
            return res.status(400).send({status: 0, message: 'User ID field is required'});
        }
        else if (!req.headers.authorization){
            return res.status(400).send({status: 0, message: 'Authentication Field is required'});            
        }
        else{         

            if(req.file){
                user_image        = req.file.path
             } 

               const updateUser =  await User.findOneAndUpdate({_id: req.user._id},{
                user_fname: userUpdate.user_fname,
                user_lname: userUpdate.user_lname,
                //hospital_id: userUpdate.hospital_id,                  
                agency_id: userUpdate.agency_id,                  
                branch_id: userUpdate.branch_id,                  
                user_phone: userUpdate.user_phone,                  
                    user_image: (req.file ? req.file.path : req.user.user_image),                  
                    user_is_profile_complete: 1                    
                },{new:true});
                if(updateUser){                    
                    return res.status(200).send({status: 1, message: 'Profile Update Successfully.', data: updateUser});
                }else{
                    return res.status(400).send({status: 0, message: 'Something Went Wrong.'});
                }
            
        }

      } catch (e){
        return res.status(400).send(e);
      }
}

// Here user login
const userLogin = async (req, res) => {
    try{

        if(!req.body.user_email){
            return res.status(400).send({status: 0, message: 'User Email field is required'});
        }
        else if (!req.body.user_password){
            return res.status(400).send({status: 0, message: 'Password field is required'});
        }
        else if (!req.body.user_device_type){
            return res.status(400).send({status: 0, message: 'User Device Type field is required'});
        }
        else if (!req.body.user_device_token){
            return res.status(400).send({status: 0, message: 'User Device Token field is required'});
        }
        else
        {           
            const user = await User.findOne({user_email: req.body.user_email, is_blocked: 0});           
            if(!user){
                return res.status(400).send({status: 0, message: 'Email not found!'});
            }   
            const isMatch = await bcrypt.compare(req.body.user_password, user.user_password);    
            if(!isMatch){                
                return res.status(400).send({status: 0, message: 'Password not match!'});
            }
            //  console.log(user);
            //  return;
            if(user.admin_approved == 1){
            await user.generateAuthToken();  
            const updateUser =  await User.findOneAndUpdate({_id: user._id},{                
                user_device_type: req.body.user_device_type,
                user_device_token: req.body.user_device_token
            },{new:true});      
            return res.status(200).send({status: 1, message: 'Login Successful.', data: updateUser});
           }else{
            return res.status(400).send({status: 0, message: 'This user is not approved contact to admin!'});
           }
        }
      } catch(e) {
        return res.status(400).send(e);
      }
}

// Here user logout
const userLogout = async (req, res) => {
    try{

        if(!req.body.user_id){
            return res.status(400).send({status: 0, message: 'User ID field is required'});
        }
        else if (!req.headers.authorization){
            return res.status(400).send({status: 0, message: 'Authentication Field is required'});            
        }
        else
        {      
                const updateUser =  await User.findOneAndUpdate({_id: req.body.user_id},{
                    user_authentication: null,
                    user_device_type: null,
                    user_device_token: null
                });
                return res.status(200).send({status: 1, message: 'User logout Successfully.'});
            
        }
      } catch(e) {
        return res.status(400).send(e);
      }
}

// Here user Forget Password
const userForgotPassword = async (req, res) => {
    try{
        if(!req.body.user_email){
            return res.status(400).send({status: 0, message: 'User Email field is required'});
        }
        else{
            const userFind =  await User.findOne({user_email: req.body.user_email});            
            if(userFind){
            //const verificationCode = Math.floor(100000 + Math.random() * 900000);
            const verificationCode = '123456';
            const updatedUser = await User.findOneAndUpdate({_id: userFind._id},{user_verification_code: verificationCode},{new: true});             
             sendEmail(userFind.user_email, verificationCode);             
             return res.status(200).send({status: 1, message: 'Verification Code Send please check your email.', data: updatedUser});
           }
           else{
            return res.status(400).send({status: 0, message: 'User Email not found!'});
           }
        }
             
       } catch(e){
        return res.status(400).send(e);
       }
}

// Here user update password
const userPasswordUpdate = async (req, res) => {
    try{

        if (!req.body.new_password){
            return res.status(400).send({status: 0, message: 'User New Password Field is required'});            
        }
        else
        {      
            const userFind =  await User.findOne({user_email: req.body.user_email});
           
             if(userFind)  {
                const newPassword = await bcrypt.hash(req.body.new_password, 8);                
                const updateUser =  await User.findOneAndUpdate({_id: userFind._id},{
                    user_password: newPassword,
                    user_verification_code: null
                },{new:true});
                return res.status(200).send({status: 1, message: 'New Password Update Successfully.',data: updateUser});
             }
             else{
                return res.status(400).send({status: 0, message: 'User Email and Verification code not match!'});
               }
        }
      } catch(e) {
        return res.status(400).send(e);
      }
}

// Here user update password
const changePassword = async (req, res) => {
    try{

       if(!req.body.old_password){
            return res.send({status: 0, message: 'Old Password field is required'});
        }
        else if(!req.body.new_password){
            return res.send({status: 0, message: 'New Password field is required'});
        }
        else{
            const userFind =  await User.findOne({_id: req.body.user_id});        
             if(userFind){
                  const oldPassword = await bcrypt.compare(req.body.old_password, userFind.user_password);                                   

                if(userFind && oldPassword == true){
                     const newPassword = await bcrypt.hash(req.body.new_password, 8);
                      await User.findOneAndUpdate({_id: req.body.user_id},{user_password: newPassword});
                      return res.send({status: 1, message: 'New password Update Successfully.'});
                }
                else{
                    return res.send({status: 0, message: 'Password Not Match'});
                }

             }else{
                return res.send({status: 0, message: 'Something Went Wrong.'});
             }
        }

       } catch(e) {
        res.status(400).send(e);
       }
}

// User social login 
const socialLogin = async(req, res) => {
    try{

        if(!req.body.user_social_token){
            return res.status(400).send({status: 0, message: 'User Social Token field is required'});
        }
        else if (!req.body.user_social_type){
            return res.status(400).send({status: 0, message: 'User Social Type field is required'});
        }
        else if (!req.body.user_device_type){
            return res.status(400).send({status: 0, message: 'User Device Type field is required'});
        }
        else if (!req.body.user_device_token){
            return res.status(400).send({status: 0, message: 'User Device Token field is required'});
        }
        else
        {
            const checkUser = await User.findOne({user_social_token : req.body.user_social_token});
           
            if(!checkUser){                
                const newRecord =  new User();
                // if(req.file){
                //     newRecord.user_image    = req.file.path
                //  }
                 newRecord.user_image       = req.body.user_image
                newRecord.user_social_token = req.body.user_social_token,
                newRecord.user_social_type  = req.body.user_social_type,
                
                newRecord.user_device_type  = req.body.user_device_type,
                newRecord.user_device_token = req.body.user_device_token
                newRecord.user_name         = req.body.user_name,
                newRecord.user_is_verified  = 1
                
                await newRecord.generateAuthToken(); 
                const saveLogin = await newRecord.save();

                return res.status(200).send({status: 1, message: 'Login Successfully', data:saveLogin});
            }else{
            
                const token  = await checkUser.generateAuthToken();                                  
                const upatedRecord = await User.findOneAndUpdate({_id: checkUser._id},
                    {user_image:req.body.user_image,user_social_type: req.body.user_social_type,user_device_type:req.body.user_device_type,user_device_token:req.body.user_device_token,user_is_verified:1,user_authentication:token}
                    ,{new: true});
                    return res.status(200).send({status: 1, message: 'Login Successfully', data: upatedRecord});               
            }    
            
      
        }
      } catch(e) {
        return res.status(400).send(e);
      }
}

// Here get Content by type
const content = async(req, res) => {
    try{
     
        if(!req.body.content_type){
            return res.status(400).send({status: 0, message: 'Content field is required'});
        }
        else{                           
              const contentFind = await Content.findOne({content_type: req.body.content_type});                       
               if(contentFind){
                return res.status(200).send({status: 1, data: contentFind});
               }
               else{
                return res.status(400).send({status: 0, message: 'Content type not found!'});
               }
            
        }
     } catch(e){
        return res.status(400).send(e);
     }
}

// Help and FeedBack
const addHelpAndFeedback = async(req, res) => {
    try{
     
        if(!req.body.subject){
            return res.status(400).send({status: 0, message: 'Subject field is required'});
        }
        else if (!req.body.message){
            return res.status(400).send({status: 0, message: 'Message field is required'});
        }
        else{     
           
               const help = new HelpAndFeedback(req.body);                     
              const saveHelp = await help.save();                       
               if(saveHelp){
                return res.status(200).send({status: 1,message:"Success", data: saveHelp});
               }
               else{
                return res.status(400).send({status: 0, message: 'Content type not found!'});
               }
            
        }
     } catch(e){
        return res.status(400).send(e);
     }
}

// Help and FeedBack
const deleteNurse = async(req, res) => {
    try{
     
        if(req.body.nurse_id){
            return res.status(400).send({status: 0, message: 'Nurse ID field is required'});
        }
        
        else{     
            

             const delNurse = await User.updateOne({_id: req.body.nurse_id},{is_blocked: 1});
                  if(delNurse){
                         await Patient.updateMany({user_id: req.body.nurse_id},{is_blocked: 1});
                    return res.status(200).send({status: 0, message: 'Nurse Delete Successfully!'});  
                  }
            
       }
     } catch(e){
        return res.status(400).send(e);
     }
}


const msg = async(req, res) => {
    return res.status(400).send({message: 'Welcome to Redrock Application!'});
}





module.exports = {   
    addHospital,
    addHospitalBranch, 
    hospitalList,
    signUp,    
    user_verification,
    resendCode,
    completeProfile,
    userLogin,
    userLogout,
    userForgotPassword,
    userPasswordUpdate,
    socialLogin,
    content,
    changePassword,
    addHelpAndFeedback,
    deleteNurse,
    msg,    
}