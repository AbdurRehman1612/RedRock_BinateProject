const {User} = require('../models/User');
const fs = require('fs');

const setHeader = (token) => {
    const setToken  = token.substring(7);
    return setToken; 
}

const auth = async(req, res, next) => {
  
     if (!req.body.user_id){
      return res.status(400).send({status: 0, message: 'User ID field is required!'});
      }
      else if (!req.headers.authorization){
        return res.status(401).send({status: 0, message: 'Authentication Field is required'});            
      }
     
     else{        
    const userFind =  await User.findOne({_id: req.body.user_id, user_authentication: setHeader(req.headers.authorization)}); 
     if(userFind){
          req.user = userFind;
          next();
        
     }else{
        if(req.file){
            fs.unlinkSync(req.file.path);
        }
        return res.status(401).send({status: 0, message: 'Wrong Auth Token!'});
     }
    }
}

module.exports = {auth}