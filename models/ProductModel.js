const mongoose = require('mongoose');

// Product Schema
const productSchema  = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      }, 
    product_name: {
        type: String,
        default: null,
        trim: true,
     },
    product_detail: {
        type: String,
        default: null,
        trim: true,
     },
    product_weight: {
        type: String,
        default: null,
        trim: true,
     },
    product_height: {
        type: String,
        default: null,
        trim: true,
     },
    product_need: {
        type: String,
        default: null,
        trim: true,
     },
    product_pricing_type_a: {
        type: String,
        default: null,
        trim: true,
     },
    product_pricing_type_b: {
        type: String,
        default: null,
        trim: true,
     },
    product_pricing_type_c: {
        type: String,
        default: null,
        trim: true,
     },
    is_blocked:{
     type: Number,
     default: 0,
     trim: true,
    }
}, {
    timestamps: true
});

// Product Images Schema
const productImagesSchema  = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
     },
    product_images: {
        type: String,
        default: null,
        trim: true,
     },   
    is_blocked:{
     type: Number,
     default: 1,
     trim: true,
    }
}, {
    timestamps: true
});


// Product Images Schema
const productFeatureSchema  = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
     },
    feature_title: {
        type: String,
        default: null,
        trim: true,
     },
    feature_detail: {
        type: String,
        default: null,
        trim: true,
     },
    feature_price: {
        type: String,
        default: null,
        trim: true,
     },
    is_blocked:{
     type: Number,
     default: 1,
     trim: true,
    }
}, {
    timestamps: true
});

// Category Schema
const categorySchema  = new mongoose.Schema({       
    category_name: {
       type: String,
       default: null,
       trim: true,
    },    
    is_blocked:{
     type: Number,
     default: 1,
     trim: true,
    },
}, {
   timestamps: true
});

const Product           = mongoose.model('Product', productSchema);
const ProductImages     = mongoose.model('ProductImages', productImagesSchema);
const ProductFeature    = mongoose.model('ProductFeature', productFeatureSchema);
const Category          = mongoose.model('Category', categorySchema);

module.exports = {Product,ProductImages,ProductFeature,Category};