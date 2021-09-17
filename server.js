const express =  require('express');
const dotenv = require('dotenv');

// LOad env vars:
dotenv.config({ path: './config/config.env'});

const app =express();

const PORT = process.env.PORT;



app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});add .NODE_ENV