const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// @description: Load json data files to the dB:

// Load env vars:
dotenv.config({ path: './config/config.env'});

// Load Models
const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/Courses');
const User = require('./models/User');
const Review = require('./models/Reviews');
// Connect to dB:
const connectdB = require('./config/db');
connectdB();

const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import to dB:
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log('Data Uploaded to dB'.green.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

// Delete data From dB:
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data Destroyed...'.red.inverse);
        process.exit();
    } catch (err) {
        console.error(err);
    }
}

// Parse command line Argument in order to exec func:
if ( process.argv[2] === '-i'){
    importData();
    // console.log('Upload Data'.green.inverse);
} else if ( process.argv[2] === '-d') {
    deleteData();
    // console.log('Delete Data'.red.inverse);
} else {
    console.log(' add option to command line:\n -i to install data\n -d to remove data'.yellow);
    process.exit();
}
