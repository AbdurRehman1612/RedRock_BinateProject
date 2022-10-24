const {Order} = require('../models/OrderModel');
const {Notification} = require('../models/User');


// Add Order
const addOrder = async(req, res) => {    
    try{        
      
         const order = new Order({
            order_number: req.body.order_number,
            orderItems: req.body.orderItems,
            order_title: req.body.order_title,
            order_details: req.body.order_details,
            order_delivery_date: req.body.order_delivery_date,
            order_stat_delivery: req.body.order_stat_delivery,
            nurse_id: req.body.nurse_id,
            patient_id: req.body.patient_id,
            product_features: req.body.product_features,
            agency_id:req.body.agency_id,
            branch_id:req.body.branch_id,
            is_read:req.body.is_read
         });
         console.log('order', order)
         const orderNumber = Math.floor(100000 + Math.random() * 900000);
         order.order_number = orderNumber;
        const newRecord =  await order.save();
          if(newRecord){

            const newOrder = req.app.locals.socketGlobal;
            if(newOrder) {
              //console.log(newOrder);
              newOrder.emit('newOrder', newRecord);      
            }

            return res.status(200).send({status: 1,message: 'Success', data: newRecord});
          }

        
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}

// Check order if  same date
const checkOrder = async(req, res) => {    
    
    try{        
        const findOrder = await Order.findOne({is_blocked: 0, patient_id: req.body.patient_id}).sort({_id: -1}).limit(1);
        const currentDate = new Date().toISOString().slice(0, 10);
        
        if(findOrder){         
         if(currentDate == findOrder.createdAt.toISOString().slice(0, 10)){
            return res.status(200).send({status: 1,indication: 1});
         }
         else{
             return res.status(200).send({status: 1,indication: 0});
         }
        }
         else{
            return res.status(200).send({status: 1,indication: 0});
        }
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}

// Order List
const orderList = async(req, res) => {
  
    try{        
        
       const getOrder = await Order.find({is_blocked: 0, nurse_id: req.body.user_id, order_status: req.body.order_status}).sort({_id: -1}).populate("patient_id",'patient_fname patient_lname');
         if(getOrder){
            return res.status(200).send({status: 1,message: 'Success', data: getOrder});
         }
         else{
            return res.status(200).send({status: 0,message: 'No Order Found!'});
         }
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}


// Pateint Order List
const patientOrderList = async(req, res) => {    
    try{        

        if(!req.body.patient_id){
            return res.status(400).send({status: 0, message: 'Patient field is required'});
            }  
            else{
        
                const getOrder = await Order.find({is_blocked: 0, patient_id: req.body.patient_id}).sort({_id: -1}).populate("patient_id",'patient_fname patient_lname');
                    if(getOrder){
                        return res.status(200).send({status: 1,message: 'Success', data: getOrder});
                    }
                    else{
                        return res.status(200).send({status: 0,message: 'No Order Found!'});
                    }
        }
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}

// Pateint Order List In process
const patientOrderListInProcess = async(req, res) => {    
    try{        

        if(!req.body.patient_id){
            return res.status(400).send({status: 0, message: 'Patient field is required'});
            }  
            else{
        
                const getOrder = await Order.find({is_blocked: 0,order_status: 'in_process', patient_id: req.body.patient_id}).sort({_id: -1}).populate("patient_id",'patient_fname patient_lname');
                    if(getOrder){
                        return res.status(200).send({status: 1,message: 'Success', data: getOrder});
                    }
                    else{
                        return res.status(200).send({status: 0,message: 'No Order Found!'});
                    }
        }
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}

// Pick up request
const pickUpRequest = async(req, res) => {    
    try{        

        if(!req.body.order_id){
            return res.status(400).send({status: 0, message: 'Order ID field is required'});
          }
          else if(!req.body.item_id){
            return res.status(400).send({status: 0, message: 'Item ID field is required'});
          }  
            else{
                    const findOrder = await Order.findOne({_id: req.body.order_id});
                     if(findOrder){
                        const getOrder = await Order.updateOne({
                            "orderItems._id": req.body.item_id},
                            {
                                $set: {
                                    "orderItems.$.product_status" : req.body.product_status
                                }
                            }
                            );
               
                            if(getOrder){        
                                const newOrder = req.app.locals.socketGlobal;
                                if(newOrder) {
                                 console.log(getOrder);
                                  newOrder.emit('orderStatus', req.body.order_id);      
                                }
                                
                                return res.status(200).send({status: 1,message: 'Status Change Successfully!'});
                            }
                }
                    else{
                        return res.status(200).send({status: 0,message: 'No Order Found!'});
                    }
        }
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}


const notificationList = async(req, res) => {    
    try{        

        const getList = await Notification.find({is_blocked: 0,user_id: req.body.user_id}).sort({_id: -1});
          if(getList){
            return res.status(200).send({status: 1,message: 'Success', data:getList});
          }
          else{
            return res.status(400).send({status: 0,message: 'No Record Found!'});
          }
          
                   
    }catch(err){
        return res.status(400).send(err.message);
    }
}

module.exports = {   
    addOrder,
    orderList,
    patientOrderList,
    pickUpRequest,
    checkOrder,
    patientOrderListInProcess,
    notificationList,
    
}