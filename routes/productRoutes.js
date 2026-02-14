const express =  require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const upload = require("../config/multer");

const productController = require('../controllers/productController');

router.post('/upload-products',auth , upload.single('image'), productController.createProduct);
router.get('/products',productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.put('/products/:id',auth, upload.single('image'), productController.updateProduct);
router.delete('/products/:id',auth, productController.deleteProduct);

module.exports = router;