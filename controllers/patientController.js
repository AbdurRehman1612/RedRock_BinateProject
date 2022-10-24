const {Patient} = require('../models/User');


// Add New Patient
const addPatient = async(req, res) => {
    const patient = new Patient(req.body);    
   
    try{        
          if(!req.body.user_id){
            return res.status(400).send({status: 0, message: 'User ID field is required'});
            }                   
       
                    
             
              else{
             const newPatient = await patient.save();             
             if(newPatient){
                return res.status(200).send({status: 1, message: 'Patient Successfully.',data: newPatient});
             }
            }
          
                   
    }catch(err){
        return res.send(err.message);
    }
}

// Update Patient
const updatePatient = async(req, res) => {
      const postData = req.body;
        
    try{        
          if(!req.body.patient_id){
            return res.status(400).send({status: 0, message: 'Patient field is required'});
            }                   
       
          else{
            
              const updatePa = await Patient.findByIdAndUpdate({_id:req.body.patient_id}
              ,{
                patient_fname: postData.patient_fname,
                patient_lname: postData.patient_lname,
                patient_phone: postData.patient_phone,
                patient_dob: postData.patient_dob,
                patient_gender: postData.patient_gender,
                patient_liter_flow: postData.patient_liter_flow,
                patient_height_feet: postData.patient_height_feet,
                patient_height_inches: postData.patient_height_inches,
                patient_weight: postData.patient_weight,
                patient_address: postData.patient_address,
                patient_address2: postData.patient_address2,
                patient_city: postData.patient_city,
                patient_country: postData.patient_country,
                patient_state: postData.patient_state,
                patient_zipcode: postData.patient_zipcode,
              },{new: true});
              if(updatePa){                
                return res.status(200).send({status: 1, message: 'Update Successfully.', data:updatePa});
              }
              else{
                return res.status(200).send({status: 0, message: 'Patient ID not found!'});
              }
            
          }
                   
    }catch(err){
        return res.send(err);
    }
}

// Patient List
const patientList = async(req, res) => {
    
   
    try{        
         const listPatient = await Patient.find({user_id: req.body.user_id}).sort({_id: -1});
      if(listPatient){                
        return res.status(200).send({status: 1, message: 'Success', data: listPatient});
      }
              
                   
    }catch(err){
        return res.send(err.message);
    }
}


module.exports = {   
    addPatient,
    patientList,
    updatePatient
}