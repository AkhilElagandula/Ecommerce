const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

//Return All the products.
exports.getProducts = async (req, res, next) => {
    try {
        const totalItems = await Product.find().countDocuments();
        const products = await Product.find()
            .populate('ratings.user')
        res.status(200).json({
            message: 'Products Fetched successfully.',
            products: products,
            status: 200,
            totalItems: totalItems
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//For Admin, who can create a product.
exports.createProduct = async (req, res, next) => {
    const { name, description, price, category, brand, stockQuantity, images, ratings } = req.body;
    const product = new Product({
        name: name,
        description: description,
        price: price,
        category: category,
        brand: brand,
        stockQuantity: stockQuantity,
        images: images,
        ratings: ratings
    });
    try {
        await product.save()
        // const user = User.findById(req.userId);
        res.status(201).json({
            message: 'Product created successfully',
            post: product,
            status: 201,
            // creator: { _id: user._id, name: user.name }
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};