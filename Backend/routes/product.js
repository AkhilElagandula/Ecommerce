const express  = require('express');
const productController = require('../controllers/product');

const router =  express.Router();

router.get('/getAllProducts', productController.getProducts);

router.post('/createProduct', productController.createProduct);

module.exports = router;