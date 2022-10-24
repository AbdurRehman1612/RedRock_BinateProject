const { Conversation, Message } = require("../models/ConversationModel");
const { User } = require("../models/User");
const { ObjectId } = require("mongodb");

const saveConversation = async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const saveConversation = await newConversation.save();
    res.status(200).send(saveConversation);
  } catch (error) {
    res.send(error.message);
  }
};

// get Conversation
// const getConversation = async (req, res) => {
//     try{
//           const conversation = await Conversation.find({
//               members: {$in : [req.params.userId]},
//           });
//           res.status(200).send({conversation});
//     }catch(error){
//         res.send(error.message);
//       }
// }

const getConversation = async (req, res) => {
  console.log("req.params.userId", req.query.id);
  try {
    const conversationsData = await Conversation.aggregate([
      { $match: { members: req.query.id } },

      {
        $lookup: {
          from: "patients",
          let: { members: "$members" },
          pipeline: [
            {
              $match: { $expr: { $in: [{ $toString: "$_id" }, "$$members"] } },
            },
            { $project: { patient_fname: 1, patient_lname: 1 } },
          ],
          as: "members",
        },
      },
    ]);
    const conversations = await Promise.all(
      conversationsData.map(async (con) => {
        const messagesCount = await Message.find({
          conversationId: con._id,
          is_read: 1,
        }).countDocuments();
        return { ...con, messagesCount };
      })
    );
    console.log(conversations);

    res.status(200).send({ conversations: conversations });
  } catch (error) {
    res.send(error.message);
  }
};

// get Users
const getUsers = async (req, res) => {
  const userId = req.query.userId;
  const name = req.query.name;
  try {
    const user = await User.findById(userId);
    res.status(200).send(user);
  } catch (error) {
    res.send(error.message);
  }
};

// chat open
const createChatConversation = async (req, res) => {
  try {
    let conversation = await Conversation.findOne({
      members: { $all: [req.body.firstUserId, req.body.secondUserId] },
    });
    if (conversation == null) {
      const newConversation = new Conversation({
        members: [req.params.firstUserId, req.params.secondUserId],
      });
      conversation = await newConversation.save();
    }
    const conversations = await Conversation.aggregate([
      { $match: { _id: ObjectId(conversation._id) } },
      {
        $lookup: {
          from: "users",
          let: { members: "$members", conversation_id: "$_id" },
          pipeline: [
            {
              $match: { $expr: { $in: [{ $toString: "$_id" }, "$$members"] } },
            },
            { $project: { name: 1 } },
          ],
          as: "members",
        },
      },
    ]);
    res.status(200).send({ newRecord: conversations[0] });
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = {
  saveConversation,
  getConversation,
  getUsers,
  createChatConversation,
};
