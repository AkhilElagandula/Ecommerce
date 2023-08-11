const express = require('express');
const userController = require('../controllers/user');
const { body } = require('express-validator');

const router = express.Router();

router.post('/signUp',
    [
        body('userName', 'Please enter the UserName of atleast 4 characters.').isLength({ min: 4 }).not().isEmpty(),
        body('email').isEmail().normalizeEmail(),
        body('fullName', 'Please enter the Full Name of atleast 6 characters.').isLength({ min: 6 }).not().isEmpty(),
        body('password', 'Please enter password of atleast 6 characters.').isLength({ min: 6 }).not().isEmpty(),
        body('gender').not().isEmpty()
    ]
    , userController.signUp);

router.post('/login',
    [
        body('email').isEmail()
        .withMessage('Please enter the email.').normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Please enter password of atleast 6 characters.')
            .not().isEmpty()
            .withMessage('Please enter the password'),
    ]
    , userController.login);

router.post('/reset-Password', userController.getResetPasswordLink);

router.post('/setNewPassword/:token',
    [
        body('password', 'Please enter password of atleast 6 characters.').isLength({ min: 6 }).not().isEmpty()
    ]
    , userController.resetPassword);

router.put('/addUserAddress',
    [
        body('address', 'Please add address.').not().isEmpty(),
    ]
    , userController.saveUserAddress);

router.put('/uploadProfilePic', userController.saveProfilePicture);

module.exports = router;