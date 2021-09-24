const express =  require('express');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const morgan = require('morgan');
const connectdB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
// Load env vars:
dotenv.config({ path: './config/config.env'});

// Route files:
const Bootcamps = require('./routes/bootcamps');
const Courses = require('./routes/courses');
const Auth = require('./routes/auth');
const Users = require('./routes/users');
const Reviews = require('./routes/reviews');
// Connect to dB:
connectdB();

const app = express();
const URL = process.env.URL;

// Body Parser:
app.use(express.json());

// Cookie parser:
app.use(cookieParser());

// Dev Logging middleware:
if( process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// File Uploading:
app.use(fileUpload());

// Sanitize data;
/**
 *  protect from attack like this, 
 *  where you can get the token even without known user 
 *  
 *  {
 *      "email": {"$gt":""},
 *      "password": "123456"
 *  }
 */
app.use(mongoSanitize());

// Set security headers, enable helmet:
app.use(helmet());
// Set xss sanitizer:
app.use(xss());
// Protect against http pollution
app.use(hpp());
// Protect against repeated request ( brute force pass attack ):
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 1
});
app.use(limiter);
// Enable CORS:
app.use(cors());

// Set Static Folder in order to be accessible from the browser:
app.use(express.static(path.join(__dirname,'public')));

// Import and use a Middleware exp:
app.use(logger);

// Mount Routers:
app.use(`${URL}/bootcamps`, Bootcamps);
app.use(`${URL}/courses`, Courses);
app.use(`${URL}/auth`, Auth);
app.use(`${URL}/users`, Users);
app.use(`${URL}/reviews`, Reviews);

// Enable MIddleware errorHandler after mounting the router 
// otherwise it will not work since router/error doesn't exist yet:
app.use(errorHandler);



const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections:
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server && exit process:
    server.close(() => process.exit(1));
});