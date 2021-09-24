const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmails = require('../utils/sendEmails');
const crypto = require('crypto');
const User = require('../models/User');

// @description: register user
// @route: POST /api/v1/auth/register
// @access PUBLIC

exports.register = asyncHandler( async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create User:
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

// @description: login the user
// @route: POST /api/v1/auth/login
// @access PUBLIC

exports.login = asyncHandler( async (req, res, next) => {
    const { email, password } = req.body;

    // Validate Email and Password:
    if(!email || !password){
        return next(new ErrorResponse('Please provide valid email and password', 400));
    }

    const user = await User.findOne({
        email
    }).select('+password');
    
    if(!user) return next(new ErrorResponse('Invalid credentials', 401));

    // Check if password matches:
    const isMatch = await user.matchPassword(password);
    if(!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

   sendTokenResponse(user, 200, res);
});

// @description: logout the user
// @route: POST /api/v1/auth/logout
// @access PRIVATE

exports.logout = asyncHandler( async (req, res, next) =>{
    res.cookie('token','none', { 
        expires: new Date(Date.now() + 10),
        httpOnly: true
        
    });

    res.status(200).json({
        success: true,
        message: 'logged out!'
    });
});

// @description: Get current logged user
// @route: GET /api/v1/auth/me
// @access: PRIVATE

exports.getMe = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({ success: true, data: user});
});

// @description: Update current user
// @route: PUT /api/v1/auth/update
// @access: PRIVATE

exports.updateMe = asyncHandler( async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
        }, {
        new: true, 
        runValidators: true});

    if(!user) return next( new ErrorResponse('User is not logged', 401));

    res.status(200).json({ success: true, data: user});
});

// @description: Change Password User
// @route: PUT /api/v1/auth/update-password
// @access PUBLIC

exports.updatePassword = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password:
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next( new ErrorResponse('Password is incorrect',401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
});

// @description: Forgot Password
// @route: POST /api/v1/auth/forgot-password
// @access: PUBLIC

exports.forgotPassword = asyncHandler( async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email});

    if(!user) return next( new ErrorResponse('No User with that email',404));

    // Get reset token:
    const resetToken = user.getResetToken();

    await user.save({ validateBeforeSave: false});

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    const message = `You are receiving this email because you ( or someone else ) 
                    has requested the reset of the password. Please make a 
                    PUT request to:\n\n ${resetUrl}`;
    
    try {
        await sendEmails({
            email: user.email,
            subject: 'Password reset Token',
            message
        });
        res.status(200).json({ success: true, message: 'Email Sent'});
    } catch (error) {
        console.error(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false});
        next( new ErrorResponse('Email couldn\'t be sent', 500));
    }

});


// @description: Reset Password
// @route: PUT /api/v1/auth/reset-password/:resettoken
// @access: PUBLIC

exports.resetPassword = asyncHandler( async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');
    
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now()} });

    if(!user) return next( new ErrorResponse('Invalid Token',400));

    //Set the New Password:
    console.log('New Password:', req.body.password)
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
});


// Get token from Model, create cookie and send response:
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000 ),
        httpOnly: true
    };

    // if in Production:
    if(process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(statusCode).cookie('token', token, options).json({ success: true, token});
}