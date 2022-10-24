const {Product,ProductImages,ProductFeature, Category} = require('../../models/ProductModel');
const { body, validationResult, cookie } = require('express-validator');

  // Get All Product list
  const getAllProduct = async (req, res) => {
    try{
         const getAllProduct = await Product.find({is_blocked:0},{product_name:1});
          if(getAllProduct){          
            return res.status(200).json({getAllProduct});
          }
    }catch(error){        
      res.send(error.message);
    }
  }

  const ProductVlidation = [  
    body('product_name').not().isEmpty().trim().withMessage('Product Name is required!'),
     
  ]

  // Here Add Prodcut
const addPrdocut = async(req, res) => {
  if(req.body.id == ''){
  try {
    validationResult(req).throw();

   try{
  
           const product = new Product(req.body);                    
          
            const existsProduct = await Product.findOne({product_name: product.product_name});                       
             if(existsProduct){
              if(req.file == ''){
                  fs.unlinkSync(req.file.path); 
              }   
               return res.status(400).send({status: 0, message: 'This product name already exists!'});                
             }
             else{                     
                //  console.log(req.body);
                //  return;
                      const saveProduct =   product.save(async function(err, data) {
                       
                          try{
                          var i = '';                                              
                          for(i=0; i<(req.files.length); i++){
                              const pdImages = new ProductImages();
                      
                              pdImages.product_id = data._id;
                              pdImages.product_images =  req.files[i].path;
                          
                              await pdImages.save();
                          
                          }
                          //return res.send({saveProduct, data:{ _id: data._id}});
                          return res.status(200).json({msg: 'Data Saved Successfully!', data:{ _id: data._id}});
                          
                      } catch(e){
                          return res.status(400).send(e);
                      }                                                
                         
                  });   
                  }
          
      
   } catch(e){
      return res.status(400).send(e);
   }

  }catch(err){        
    return res.status(400).json({error: err.mapped()});
 }
  }

 else{          
    const updateRecord =  await Product.updateOne({ _id: req.body.id},
      {category_id: req.body.category_id,product_name: req.body.product_name,product_detail:req.body.product_detail,
        product_weight:req.body.product_weight,product_height:req.body.product_height,product_need:req.body.product_need,
        product_pricing_type_a:req.body.product_pricing_type_a,product_pricing_type_b:req.body.product_pricing_type_b,product_pricing_type_c:req.body.product_pricing_type_c});
    if(updateRecord){
    return res.status(200).json({msg: 'Update Successfully!'});
    }
}  

}


const productFeatures = async (req, res) => {
  try {
     
    if (!req.body.product_id) {
      return res
        .status(400)
        .send({ status: 0, message: "Product ID field is required" });
    } else if (!req.body.feature_title) {
      return res.status(400).send({
        status: 0,
        message: "Product Feature Title field is required",
      });
    } else if (!req.body.feature_detail) {
      return res.status(400).send({
        status: 0,
        message: "Product Feature Details field is required",
      });
    } else if (!req.body.feature_price) {
      return res.status(400).send({
        status: 0,
        message: "Product Feature Price field is required",
      });
    } else {
      const existsProduct = await Product.findOne({ _id: req.body.product_id });
      if (existsProduct) {
        const existsProductFea = await ProductFeature.findOne({
          feature_title: req.body.feature_title,
        });
        if (existsProductFea) {
          return res
            .status(400)
            .send({ status: 0, message: "Title Already exists!" });
        } else {
          const feaProduct = new ProductFeature(req.body);
          const newFeature = await feaProduct.save();
          if (newFeature) {
            return res
              .status(200)
              .send({ status: 1, message: "Success", data: newFeature });
          }
        }
      } else {
        return res
          .status(400)
          .send({ status: 0, message: "Product Not Found!" });
      }
    }
  } catch (e) {
    return res.status(400).send(e);
  }
};


// Delete Product
const deleteProduct = async (req, res) => {
  try{         
       const delProduct = await Product.findByIdAndDelete({_id: req.params.product_id});
        if(delProduct){          
          return res.status(200).json({msg: 'Delete Successfully!'});
        }
  }catch(error){        
    res.send(error.message);
  }
}

const productEdit = async (req, res) => {
  try{    
           
       const productEdit = await Product.findOne({_id: req.params.product_id});         
        if(productEdit){            
            return res.status(200).json({productEdit});
        }
  }catch(error){        
    return res.send(error.message);
  }
}
  


  // Get All Event list
  const getAllCategory = async (req, res) => {
    try{
  //     var variable_i_needed = req.app.locals.socketGlobal;
  //     if(variable_i_needed) {
  //       console.log(variable_i_needed)
  // variable_i_needed.emit('hello', 'for testing');

  //     }
     
         
         const categoryList = await Category.find({is_blocked: 1}, {category_name:1});
          if(categoryList){          
            return res.status(200).json({categoryList});
          }
    }catch(error){        
      return res.send(error.message);
    }
  }
  
  
  const CategoryVlidation = [  
    body('category_name').not().isEmpty().trim().withMessage('Category Name is required!'),     
  ]
  
  // Here Save Category API
const AddCategory = async (req, res) => {
 
    if(req.body.id == ''){
        try {
          validationResult(req).throw();

    try{
      
        if(req.body.id == ''){
          const checkCat = await Category.findOne({category_name: req.body.category_name});
             
           if(!checkCat){         
            const newUser = new Category();
        
            newUser.category_name           = req.body.category_name,         
            await newUser.save();              
            return res.status(200).json({msg: 'Saved Successfully!'});   

           }
           else{
            return res.status(200).json({msg: 'This Category already exists!'}); 
            
          }
        }
          
    }catch(error){        
        return res.status(500).json({errors: error});
    }

    }catch(err){        
        return res.status(400).json({error: err.mapped()});
     }
    }

     else{
          
        const updateRecord =  await Category.updateOne({ _id: req.body.id},
          {category_name: req.body.category_name});
        if(updateRecord){
         return res.status(200).json({msg: 'Update Successfully!'});
        }
      }   
  }

  // Delete Category
  const deletCategory = async (req, res) => {
    try{         
         const delBranch = await Category.findByIdAndUpdate({_id: req.params.category_id}, {is_blocked:0});
          if(delBranch){          
            return res.status(200).json({msg: 'Delete Successfully!'});
          }
    }catch(error){        
      res.send(error.message);
    }
  }

  // Category Edit
const categoryEdit = async (req, res) => {
  try{    
   
       const categoryEdit = await Category.findOne({_id: req.params.category_id});         
        if(categoryEdit){            
            return res.status(200).json({categoryEdit});
        }
  }catch(error){        
    return res.send(error.message);
  }
}

module.exports = {    
  getAllProduct,
  addPrdocut,
  ProductVlidation,
  productFeatures,
  deleteProduct,
  productEdit,
  getAllCategory,
  CategoryVlidation,
  AddCategory,
  deletCategory,
  categoryEdit 
}