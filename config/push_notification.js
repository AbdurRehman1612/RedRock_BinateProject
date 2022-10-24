var FCM = require('fcm-node');
var serverKey = 'AAAABRBNBtY:APA91bHR_is6D5WVTKcSXsSqGUcOS-VnL0HvLlr0ymHmGR3rHhxL-_FEaalvMVX0RQGJ3uQUXHds8t2rqlIJxVeDlIYaA7tqtZaKkNuSg7uowQ_yY9Tnp6d9s8hyIGU4GCKvdaovvPqU'; //put your server key here
var fcm = new FCM(serverKey);

const push_notification = (notification_obj) => {
    console.log(notification_obj)
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: notification_obj.user_device_token, 
        collapse_key: 'your_collapse_key',
        
        notification: {
            title: notification_obj.sender_text, 
            body: notification_obj.heading
        },
        
        data: {  //you can send only notification or only data(or include both)
            title: notification_obj.sender_text, 
            body: notification_obj.heading
        }
    };
    
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

module.exports = push_notification;
