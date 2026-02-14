const Product = require('../models/Product');

exports.createProduct = async(req, res) => {
    try {
        const {name , price , description , stock} = req.body;
        
        const product = await Product.create({
            name , 
            price,
            description,
            stock,
           image : req.file ? req.file.path : undefined,
           owner : req.body.userId
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({error : error.message});
    }
};

// get all products
exports.getProducts = async(req, res) => {
    const products = await Product.find().populate('owner', 'name email');
    res.json(products);
};

// get single product
exports.getProduct = async(req, res) => {
    const product = await Product.findById(req.params.id)
    res.json(product);
};

// update product
exports.updateProduct = async(req, res) => {
    const updates = req.body;

    if (req.file) {
        updates.image = req.file.filename;
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        {new : true}
    );
    res.json(product);
};

// delete product
exports.deleteProduct = async(req,res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({message : 'Product deleted successfully'});
};
