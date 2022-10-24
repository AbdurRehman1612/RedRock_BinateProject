const db = require("../models");
const push_notification = require("../utils/push_notification");

const get_messages = async(object, callback) => { 
    db.Chat.find({
            $or: [
                { $and: [{ sender_id: object.sender_id }, { receiver_id: object.receiver_id }] },
                { $and: [{ sender_id: object.receiver_id }, { receiver_id: object.sender_id }] },
            ]
        }, async(err, results) => {
            if (err) {
                callback(err);
            } else {
                callback(results);
            }
        }) 
    
        
}
const send_message = async(object, callback) => {
    
    const isuser = await db.User.find({_id: object?.sender_id})  
    if(isuser.length>0){ 
        const therapist1 = await db.Therapist.findOne({_id: object?.receiver_id})
        // console.log("ifffff",therapist1) 
    var documents_chat = new db.Chat({ sender_id: object.sender_id, sender_object: {name: isuser.name,imageName: isuser.imageName }, receiver_id: object.receiver_id,receiver_object: {name: therapist1.name,imageName: therapist1.imageName },multiModels:"User", message: object.message });
     documents_chat.save(async(err, results) => {
        if (err) {
            callback(err);
        } else {
            db.Chat.find({ _id: results._id }, async(err, results_query) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(results_query);
                    }
                })
                
                // const notification_obj = {
                //     user_device_token: reciever.token,
                //     sender_text: req.body.text,
                //     heading: `new message from ${reciever.name}` 
                //     // + SelectedStatus,
                //   }; 
                //   push_notification(notification_obj);
      

        }
    });
    }
    else{
        // console.log("elseee")
        const user1 = await db.User.findOne({_id: object?.receiver_id})
        // console.log("elseee",user1)
        // const reciever = db.User.findOne({_id: object?.reciever_id})
        var documents_chat = new db.Chat({ sender_id: object.sender_id, sender_object: {name: therapist.name,imageName: therapist.imageName }, receiver_id: object.receiver_id,receiver_object: {name: user1.name,imageName: user1.imageName },multiModels:"Therapist", message: object.message});
         documents_chat.save(async(err, results) => {
        if (err) {
            callback(err);
        } else {
            db.Chat.find({ _id: results._id }, async(err, results_query) => {
                    if (err) {
                        callback(err);
                    } else {
                        callback(results_query);
                    }
                })

                // const notification_obj = {
                //     user_device_token: reciever.token,
                //     sender_text: req.body.text,
                //     heading: `new message from ${reciever.name}` 
                //     // + SelectedStatus,
                //   }; 
                //   push_notification(notification_obj);
      
                
        }
    });
    } 
}
module.exports = {
    get_messages,
    send_message
}