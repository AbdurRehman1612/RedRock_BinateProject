const mongoose = require('mongoose');

const orderSchema  = new mongoose.Schema({
  order_number: { type: Number, required: true, default: null },    
  order_title: { type: String, required: false, default: null},  
  order_details: { type: String, required: false, default: null },  
  order_delivery_date: { type: Date,default: null,trim: true},  
  agency_id: { type: String,default: null,trim: true}, 
  branch_id:{
        type: String,
        default: null,
        required: true,
      },
  is_read: { type: Number, default: 0},
  order_stat_delivery: { 
    type: Number,    
    default: '0'
   },  
  order_status: { 
    type: String,
    enum: ['in_process','delivered','close'],
    default: 'in_process'
  },
  orderItems: [
        {
          product_name: { type: String, required: true },
          product_detail: { type: String, required: true },   
          quantity: { type: Number, required: true },    
          product_features: { type: String, required: false },     
          product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
          },
          product_status: { 
            type: String,
            enum: ['ordered','processed','out-for-delivery', 'delivered', 'pickup-requested', 'picked-up'],
            default: 'ordered'
          },
        },
      ],      
      nurse_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
       },
      patient_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
       },       
      is_blocked:{
      type: Number,
      default: 0,
      trim: true,
      }
    
}, {
    timestamps: true
});



const Order = mongoose.model('Order', orderSchema);

module.exports = {Order};