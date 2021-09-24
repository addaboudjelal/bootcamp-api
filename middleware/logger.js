// @desc Logs request to console
const logger = (req, res, next) => {
    console.log('\x1b[34m','----------------- Local Build Middleware ------------------');
    console.log(`${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    console.log('\x1b[36m','---------------- Morgan package Middleware ------------------');
    next();
};

module.exports = logger;