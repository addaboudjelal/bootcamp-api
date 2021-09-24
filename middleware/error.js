const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    // log to the server console
    console.log(err.stack.red);

    let error = { ...err};
    error.message = err.message;
    // Mongoose bad ObjectId:
    if(err.name === 'CastError') {
        const message = `Product not Found with ID: ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose Duplicate Key
    if(err.code === 11000) {
        const message = 'Duplicate Field value Entered';
        error = new ErrorResponse(message, 400);
    }

    // Mongoose Validation Error:
    if( err.name === 'ValidationError') {
        // console.log(`${Object.values(err.errors)}`.white.bgRed);
        const message = Object.values(err.errors).map( val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500 ).json({success: false, error: error.message || 'Server Error'});
};

module.exports = errorHandler;