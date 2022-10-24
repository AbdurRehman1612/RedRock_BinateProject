const express = require('express');
const router = express.Router();
const {productList,AllCategoryList} = require('../controllers/productController');
const {getAllProduct,addPrdocut,ProductVlidation,productFeatures,deleteProduct,productEdit,getAllCategory,AddCategory,categoryEdit,CategoryVlidation,deletCategory} = require('../controllers/admin/productController');
const {auth} = require('../middlewares/auth');
const {upload} = require('../config/utils');


// Routes


router.post('/api/productList',auth, productList);
router.post('/api/AllCategoryList',auth, AllCategoryList);


// For admin Routes
router.get('/api/getAllProduct', getAllProduct);
router.post('/api/addPrdocut',upload.array('product_images[]'),ProductVlidation, addPrdocut);
router.post('/api/create-admin-product-features', productFeatures);
router.post('/api/deleteProduct/:product_id', deleteProduct);
router.get('/api/productEdit/:product_id', productEdit);

router.get('/api/getAllCategory', getAllCategory);
router.post('/api/AddCategory',CategoryVlidation, AddCategory);
router.get('/api/categoryEdit/:category_id', categoryEdit);
router.post('/api/deletCategory/:category_id', deletCategory);

module.exports = router;