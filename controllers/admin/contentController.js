const {Content} = require('../../models/ContentModel');



// Get content
const getContent = async (req, res) => {      
    try{
     
        if(!req.query.content_type){
           return res.status(400).send({status: 0, message: 'Content field is required'});
        }
        else{                           
              const contentFind = await Content.findOne({content_type: req.query.content_type});                                
               if(contentFind){
                return res.status(200).send({status: 1, data: contentFind});
               }
               else{
                return res.status(400).send({status: 0, message: 'Something Went Wrong.'});
               }           
        }
     } catch(e){
        return res.status(400).send(e);
     }
}


const updateContent = async (req, res) => {      
   try{

      const content = await Content.updateOne({ content_type: req.body.pp}, {content_content: req.body.content_content});
      return res.status(200).json({msg: 'Record Update Successfully'})     
  } catch(e){
     res.status(400).send(e);
  }
}

// Updated 
const updateContentTc = async (req, res) => {      
   try{

      const content = await Content.updateOne({ content_type: req.body.tc}, {content_content: req.body.content_content});
      return res.status(200).json({msg: 'Record Update Successfully'})     
  } catch(e){
     res.status(400).send(e);
  }
}

module.exports = {    
    getContent,
    updateContent,
    updateContentTc   
}