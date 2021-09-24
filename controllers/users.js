const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const crypto = require('crypto');
const User = require('../models/User');

// @description: Get All users
// @route: GET /api/v1/users
// @access PRIVATE/ADMIN
exports.getUsers = asyncHandler( async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @description: Get Single users
// @route: GET /api/v1/users/:id
// @access PRIVATE/ADMIN
exports.getUser = asyncHandler( async (req, res, next) => {

    const user = await User.findById(req.params.id);
    res.status(200).json({
        success: true,
        data: user
    })
});

// @description: Create Single users
// @route: POST /api/v1/users
// @access PRIVATE/ADMIN
exports.createUser = asyncHandler( async (req, res, next) => {

    const user = await User.create(req.body);  
    res.status(201).json({
        success: true,
        data: user
    })
});

// @description: Update Single users
// @route: PUT /api/v1/users/:id
// @access PRIVATE/ADMIN
exports.updateUser = asyncHandler( async (req, res, next) => {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});
    res.status(200).json({
        success: true,
        data: user
    })
});

// @description: Delete Single users
// @route: DELETE /api/v1/users/:id
// @access PRIVATE/ADMIN
exports.deleteUser = asyncHandler( async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
        success: true,
        message: 'User deleted'
    })
});