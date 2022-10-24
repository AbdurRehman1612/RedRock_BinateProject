const {Product,ProductImages,ProductFeature,Category} = require('../models/ProductModel');


// Product additional features
const productFeatures = async (req, res) => {
    try{
        if(!req.body.product_id){
            return res.status(400).send({status: 0, message: 'Product ID field is required'});
        }
        else if (!req.body.feature_title){
            return res.status(400).send({status: 0, message: 'Product Feature Title field is required'});
          }  
        else if (!req.body.feature_detail){
            return res.status(400).send({status: 0, message: 'Product Feature Details field is required'});
          }  
        else if (!req.body.feature_price){
            return res.status(400).send({status: 0, message: 'Product Feature Price field is required'});
        }  
        else{
            const existsProduct = await Product.findOne({_id: req.body.product_id}); 
             if(existsProduct){
                const existsProductFea = await ProductFeature.findOne({feature_title: req.body.feature_title}); 
                  if(existsProductFea){
                    return res.status(400).send({status: 0, message: 'Title Already exists!'});
                  }
                  else{
                    const feaProduct = new ProductFeature(req.body);
                        const newFeature = await feaProduct.save();
                        if(newFeature){
                            return res.status(200).send({status: 1, message: 'Success',data: newFeature});
                        }
                    }
             }
             else{
                return res.status(400).send({status: 0, message: 'Product Not Found!'});
             }            
            
        }

    } catch (e) {
        return res.status(400).send(e);
    }
 }

 // Here get Product list
const productList = async(req, res) => {
    try{
     
                                 
              const getList = await Product.aggregate([
                {                            
                    $lookup: {
                    from: 'productimages',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product_images'
                  }
                },
                {                            
                    $lookup: {
                    from: 'productfeatures',
                    localField: '_id',
                    foreignField: 'product_id',
                    as: 'product_feature'
                  }
                },
                { 
                    $project: { 'category_id':1,'product_name':1,'product_detail':1,'product_images.product_images':1,'product_images._id':1,'product_feature.feature_title':1,
                              'product_feature.feature_detail':1,'product_feature.feature_price':1,'product_feature._id':1 } 
                            },
                            {
                                $sort: {
                                  'product_name':1
                                }
                            },
              ]);
                                             
               if(getList){
                return res.status(200).send({status: 1,message: 'Success', data: getList});
               }
               else{
                return res.status(400).send({status: 0, message: 'Product not found!'});
               }            
        
     } catch(e){
        return res.status(400).send(e);
     }
}

const AllCategoryList = async (req, res) => {
  try{
       const categoryList = await Category.find({is_blocked: 1}, {category_name:1});
        if(categoryList){          
          return res.status(200).json({status:1, message:'success', data:categoryList});
        }
  }catch(error){        
    return res.send(error.message);
  }
}


module.exports = {       
    productFeatures,
    productList,
    AllCategoryList
}