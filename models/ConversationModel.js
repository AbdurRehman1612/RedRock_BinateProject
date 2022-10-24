const mongoose = require('mongoose');

// Here is conversation Schema
const conversationSchema = new mongoose.Schema({
    
    members: {
        type: Array,        
    },
  },
    {timestamps:true}
);

// Here is message Schema
const messageSchema = new mongoose.Schema({
    
    conversationId: {
        type: String,        
    },
    sender: {
        type: String,        
    },
    text: {
        type: String,        
    },
    is_read: {
        type: Number,
        default: 1        
    }
  },
    {timestamps:true}
);

const Conversation = mongoose.model('conversation', conversationSchema);
const Message = mongoose.model('message', messageSchema);

module.exports = {Conversation,Message};