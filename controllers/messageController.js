const { Message, Conversation } = require("../models/ConversationModel");
const { Patient, User, Admin, HospitalBranch } = require("../models/User");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const push_notification = require("../config/push_notification");

const saveMessage = async (req, res) => {
  try {
    if (!req.body.sender) {
      return res
        .status(400)
        .send({ status: 0, message: "sender field is required" });
    } else {
      // const checkConversation = await Conversation.findOne({"members": req.body.sender});
      let checkConversation = await Conversation.findOne({
        members: { $all: [req.body.sender, "60b4956e6031f3174c0075f1"] },
      });

      if (checkConversation) {
        const msgObject = new Message();
        msgObject.sender = req.body.sender;
        msgObject.conversationId = checkConversation._id;
        msgObject.text = req.body.text;

        const msgSave = await msgObject.save();
        const newOrder = req.app.locals.socketGlobal;
        // if (newOrder) {
          //console.log(msgSave);
          newOrder.emit("chatMsg", msgSave);
        // }

        //const saveMessage = await Message.create(req.body);
        return res.status(200).send(msgSave);
      } else {
        const newConversation = new Conversation({
          members: [req.body.sender, "60b4956e6031f3174c0075f1"],
        });

        const saveConversation = await newConversation.save();
        if (saveConversation) {
          const msgObject = new Message();
          msgObject.sender = req.body.sender;
          msgObject.conversationId = saveConversation._id;
          msgObject.text = req.body.text;

          const msgSave = await msgObject.save();
          if (msgSave) {
            // const findUser = await Conversation.findOne({ _id: msgObject.conversationId });
            // console.log('findUser', findUser)
            // const receiver_id=findUser.members[0]
            // console.log('receiver_id', receiver_id)
            // const notification_obj = {
            //   user_device_token: receiver_id.user_device_token,
            //   sender_text: "Order Stutus " + itemStatus.order_number,
            //   heading: "Your Item Status has been changed " + SelectedStatus,
            // };
            // push_notification(notification_obj);
            return res
              .status(200)
              .send({ status: 1, message: "Message send Successfully!" });
          }
        }
      }
    }
    //  const saveMessage = await Message.create(req.body);
    //  res.status(200).send(saveMessage);
  } catch (error) {
    res.send(error.message);
  }
};

// get getMessage
const getMessage = async (req, res) => {
  try {
    //const checkConversation = await Conversation.findOne({"members": req.body.sender});
    if (!req.body.sender) {
      return res
        .status(400)
        .send({ status: 0, message: "sender field is required" });
    } else {
      let checkConversation = await Conversation.findOne({
        members: { $all: [req.body.sender, "60b4956e6031f3174c0075f1"] },
      });

      if (checkConversation) {
        const messages = await Message.find({
          conversationId: checkConversation._id,
        });

        const updateUnread = await Message.updateMany(
          { conversationId: req.body.conversationId },
          { is_read: 0 }
        );
        return res
          .status(200)
          .send({ status: 1, message: "Success", data: messages });
      } else {
        return res
          .status(400)
          .send({ status: 0, message: "Conversation Not Found!" });
      }
    }
  } catch (error) {
    res.send(error.message);
  }
};

// get getMessage
const getMessageAdmin = async (req, res) => {

  console.log('req.query.conversationId', req.query.id)
  try {
    const messages = await Message.find({
      conversationId: req.query.id,
    });

    const updateUnread = await Message.updateMany(
      { conversationId: req.query.id },
      { is_read: 0 }
    );

    res.status(200).send({ messages, updateUnread });
  } catch (error) {
    res.send(error.message);
  }
};

const saveMessageAdmin = async (req, res) => { 
  var members=[]
  var reciever_id=""
  var sender_id=""
  var token=""
  var name="" 
  try {
    const saveMessage = await Message.create(req.body);
    const newOrder = req.app.locals.socketGlobal;
    newOrder.emit("chatMsg", saveMessage);
const data= await Conversation.find({_id: req.body.conversationId})
console.log(data)
const getmembers= data.map(async(d)=>{ 
  members.push(d.members)
}) 
const allmembers = await Promise.all(getmembers);
members.map((m)=>{
  console.log('m', m)
  reciever_id=m[0]
  sender_id=m[1]
})
//  console.log("member",members)
    // console.log("reciever",reciever_id)
    const user= await Patient.findOne({_id: reciever_id}) 

    const nurse_id=user.user_id
 

    const value= await User.find({_id:nurse_id})

    const sender=await Admin.find({_id: sender_id}) 

    value.map((v)=>{
      token=v.user_device_token
    })

    sender.map((v)=>{
      name=v.name
    })


    
    const notification_obj = {
              user_device_token: token,
              sender_text: req.body.text,
              heading: `new message from ${name}` 
              // + SelectedStatus,
            }; 
            push_notification(notification_obj);


            
    res.status(200).send(saveMessage);
  } catch (error) {
    res.send(error.message);
  }
};

// get getMessage
const getUnReadMessage = async (req, res) => {
  try {
    const result = await Message.find({
      conversationId: req.params.conversationId,
      is_read: 1,
    });
    const getLength = result.length;
    //console.log('hes length',getLength);
    res.status(200).send({ unread: getLength });
  } catch (error) {
    res.send(error.message);
  }
};

async function getMsg(patient_id) {
  return await Message.find({ sender: patient_id });
}

// get getMessage
const getPatientList = async (req, res) => {
  try {
    // if(!req.body.sender){
    //   return res.status(400).send({status: 0, message: 'sender field is required'});
    //   }
    //   else{

    const getData = await Patient.aggregate([
      { $match: { user_id: ObjectId(req.body.user_id) } },

      {
        $lookup: {
          from: "messages",
          let: { sender: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "615b07d6cbf94e28b8b140e0" }, "$$sender"],
                },
              },
            },
          ],
          as: "msg",
        },
      },

      //   {
      //     $lookup: {
      //     from: 'messages',
      //     localField: 'sender',
      //     foreignField: '_id',
      //     as: 'msg'
      //   }
      // },

      // { "$lookup": {
      //   "from": "messages",
      //   "let": { "sender": "$getData._id"},
      //   "pipeline": [
      //     { "$match": { "$expr": { "$eq": [ "$sender", "615b07d6cbf94e28b8b140e0" ] }}},
      //     { "$project": { "text": 1 }}
      //   ],
      //   "as": "msg"
      // }}
    ]);
    // console.log(getData);
    //  return

    //var like = array();
    //   var resultDAta =  await Patient.find({user_id: req.body.user_id});
    //   var me = [];
    //  let i = '';
    //    for(i = 0; i < resultDAta.length; i++){
    //     var my = resultDAta[i].patient_fname;
    //     me.push(my);
    //    }

    //    console.log(me);
    //     return

    return res.status(200).send({ status: 1, message: getData });

    //}
  } catch (error) {
    res.send(error.message);
  }
};

// get getMessage
const adminInfo = async (req, res) => {
  try {
    const result = await Admin.find({});
    return res
      .status(200)
      .send({ status: 1, message: "Success", data: result });
  } catch (error) {
    res.send(error.message);
  }
};

const getDetails = async (req, res) => {
  try {
    const agencynames = await Admin.find({ isAdmin: false }).select(
      "_id hospital_name"
    );
    const nurses = await User.find()
      .populate("agency_id")
      .populate("branch_id");

    res
      .status(200)
      .send({ status: 1, agencynames: agencynames, nurses: nurses });
  } catch (error) {
    res.send(error.message);
  }
};

const getBranches = async (req, res) => {
  try {
    const branchesnames = await HospitalBranch.find({
      hospital_id: req.query.id,
    }).select("_id branch_name");

    res.status(200).send({ status: 1, branchesnames: branchesnames });
  } catch (error) {
    res.send(error.message);
  }
};

const getfilter1 = async (req, res) => {
  console.log();
  try {
    const nurses = await User.find({ agency_id: req.query.agencyid }).populate(
      "agency_id"
    );

    console.log("nurses", nurses);
    res.status(200).send({ status: 1, nurses: nurses });
  } catch (error) {
    res.send(error.message);
  }
};

const getfilter2 = async (req, res) => {
  try {
    const nurses = await User.find({ branch_id: req.query.branchid }).populate(
      "branch_id"
    );

    res.status(200).send({ status: 1, nurses: nurses });
  } catch (error) {
    res.send(error.message);
  }
};

const getfilter3 = async (req, res) => {
  try {
    const nurses = await User.find({
      agency_id: req.query.agencyid,
      branch_id: req.query.branchid,
    })
      .populate("agency_id")
      .populate("branch_id");

    res.status(200).send({ status: 1, nurses: nurses });
  } catch (error) {
    res.send(error.message);
  }
};

const getnursepatients = async (req, res) => {
  console.log("req.params.nurseId:", req.query.id);
  try {
    //const getOrderDetails = await Order.findOne({_id: req.params.order_id}).populate("nurse_id patient_id");
    const patientListsByNurseId = await Patient.find({
      user_id: req.query.id,
    });

    if (patientListsByNurseId) {
      return res.status(200).json({ patients: patientListsByNurseId });
    } else {
      return res.status(200).send({ status: 0, message: "No Patients Found!" });
    }
  } catch (err) {
    return res.status(400).send(err.message);
  }
};

module.exports = {
  saveMessage,
  getMessage,
  getUnReadMessage,
  getPatientList,
  adminInfo,
  getMessageAdmin,
  saveMessageAdmin,
  getDetails,
  getBranches,
  getfilter1,
  getfilter2,
  getfilter3,
  getnursepatients,
};
