const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use('/images', express.static(path.join(__dirname, 'images')));

const MONGO_DB_URI = 'mongodb://localhost:27017/Ecommerce';

app.use('/p', productRoutes);
app.use('/u', userRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    const code = error.code || '';
    res.status(status).json({ message: message,eCode: code, data: data, status: status });
})

mongoose.connect(MONGO_DB_URI)
    .then(result => {
        app.listen(8080);
        console.log('Server started at port 8080');
    })
    .catch(err => {
        console.log(err);
    });