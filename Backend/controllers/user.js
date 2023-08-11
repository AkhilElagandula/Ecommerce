const path = require('path');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

//Method for userto signup
exports.signUp = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Failed', statusCode: 400, errors: errors.array() });
    }
    const { userName, email, password, fullName, gender, dateOfBirth, address, phoneNumber, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            userName: userName,
            email: email,
            password: hashedPassword,
            fullName: fullName,
            gender: gender,
            dateOfBirth: dateOfBirth,
            address: address,
            phoneNumber: phoneNumber,
            role: role
        });
        const result = await user.save();
        res.status(201).json({ message: 'Success.', statusCode: 200, userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//Method for user to login
exports.login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Failed', statusCode: 400, errors: errors.array() });
    }
    const { email, password } = req.body;
    let loadUser;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'failed',
                statusCode: 400,
                errors: 'No user found with this email, Please SignUp.'
            });
        }
        loadUser = user;
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        console.log(isPasswordMatched);
        if (!isPasswordMatched) {
            return res.status(400).json({
                message: 'failed',
                statusCode: 400,
                errors: 'You have entered wrong password.Please enter correct password to login.'
            });
        }
        const jwtToken = jwt.sign(
            {
                email: loadUser.email,
                userId: loadUser._id.toString()
            },
            'secrect_key',
            { expiresIn: '1h' }
        );
        res.status(200).json({ message: 'Success.', statusCode: 200, token: jwtToken, userId: loadUser._id.toString() });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

};

//Method to save the user address
exports.saveUserAddress = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Failed',
            statusCode: 400,
            errors: errors.array()
        });
    }
    const { userName, address } = req.body;
    try {
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({
                message: 'failed',
                statusCode: 422,
                errors: 'Could not find account with the UserName, Please SignUp.'
            });
        }
        user.address = address;
        const result = await user.save();
        res.status(200).json({ message: 'Success.', statusCode: 200, user: result });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//Method to save user Profile Picture
exports.saveProfilePicture = async (req, res, next) => {
    const userName = req.body.userName;
    // console.log(userName);
    const profileImage = req.file.path.replace('\\', '/');
    // console.log(profileImage);
    try {
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(400).json({
                message: 'failed',
                statusCode: 422,
                errors: 'Could not find account with the UserName, Please SignUp.'
            });
        }
        user.profileImage = profileImage;
        const result = await user.save();
        res.status(200).json({ message: 'Success.', statusCode: 200, user: result });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//Method to generate a link for reset password
exports.getResetPasswordLink = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'failed',
                statusCode: 422,
                errors: 'Could not find account with the UserName, Please SignUp.'
            });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiration = Date.now() + 3600000;
        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();
        const resetLink = `http://localhost:8080/u/setNewPassword/token=${resetToken}`;
        res.status(200).json({ message: 'Success.', statusCode: 200, linkToResetPassword: resetLink });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

//Method to reset password
exports.resetPassword = async (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Failed', statusCode: 400, errors: errors.array() });
    }
    try {
        const token = req.params.token.split('=')[1];
        const { password } = req.body;
        const user = await User.findOne(
            {
                resetToken: token,
                resetTokenExpiration: { $gt: Date.now() }
            }
        );
        if (!user) {
            return res.status(400).json({
                message: 'failed',
                statusCode: 400,
                errors: 'Invalid or expired token'
            });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();
        res.status(200).json({ message: 'Success.', statusCode: 200 });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

