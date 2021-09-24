const mongoose = require('mongoose');

const connectdB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
    });
    console.log(`MongodB connected: ${conn.connection.host}`.cyan.underline);
};


module.exports = connectdB;
