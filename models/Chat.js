const mongoose = require('mongoose');

const chatScheme = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        refPath: "multiModels",
    },
    sender_object: {
        type: Object,
        require: false,
        
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        refPath: "multiModels",
    },
    receiver_object: {
        type: Object,
        require: false,
        
    },
    multiModels: {
    type: String,
    required: true,
    enum: ['Therapist', 'User']
  },
    group_id: {
        type: String,
        require: false
    },
    message: {
        type: String,
        require: true
    },
    is_read: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
    is_blocked: {
        type: String,
        enum: ['0', '1'],
        default: '0'
    },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatScheme);
module.exports = Chat;