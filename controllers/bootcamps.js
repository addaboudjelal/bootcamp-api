const path = require('path');
const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const geocode = require('../utils/geocoder');


// @description: GET all bootcamps
// @route:       GET /api/v1/bootcamps
// @access:      Public
exports.getBootcamps = asyncHandler( async (req, res, next) => {
    
    res.status(200).json(res.advancedResults);
});

// @description: GET single bootcamps
// @route:       GET /api/v1/bootcamps/:id
// @access:      Public
exports.getBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
    if(!bootcamp){
        // return res.status(400).json({success: false, error: 'Id doesn\'t exist'});
        return next( new ErrorResponse(`Product not Found with ID: ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: bootcamp,
    });
});

// @description: Create bootcamp
// @route:       POST /api/v1/bootcamps
// @access:      Private
exports.createBootcamp = asyncHandler( async (req, res, next) => {

    // Add user to req.body
    req.body.user = req.user;

    // Check for published bootcamp by the user:
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id});
    // if the user is not admin, they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next( new ErrorResponse(`The user with ID: ${req.user.id} has already published a bootcamp`));
    }

    const bootcamp = await Bootcamp.create(req.body);
    if(!bootcamp){
        // return res.status(400).json({success: false, error: 'Id doesn\'t exist'});
        return next( new ErrorResponse(`Product not Found with ID: ${req.params.id}`, 404));
    }
    res.status(201).json({
        success: true,
        data: bootcamp
    });      
});

// @description: Update bootcamp id
// @route:       PUT /api/v1/bootcamps/:id
// @access:      Private
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
    
    let bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        // return res.status(400).json({success: false, error: 'Id doesn\'t exist'});
        return next( new ErrorResponse(`Product not Found with ID: ${req.params.id}`, 404));
    }

    // Make sure user is the bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User has no permission in modifying bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{ 
        new: true,
        runValidators: true
    });
    
    res.status(201).json({ success: true, data: bootcamp});
});

// @description: Delete bootcamp id
// @route:       DELETE /api/v1/bootcamps/:id
// @access:      Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
    // res.send(`Delete of bootcamp id: ${req.params.id}`);
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        // return res.status(400).json({success: false, error: 'Id doesn\'t exist'});
        return next( new ErrorResponse(`Product not Found with ID: ${req.params.id}`, 404));
    }

    // Make sure user is the bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User has no permission to delete bootcamp`, 401));
    }

    // Call middleware in order to remove this bootcamp + Courses related to it ( mongoose Virtuals );
    bootcamp.remove();

    res.status(200).json({ success: true, message: 'ID removed'});
});

// @description: Get bootcamp within a radius
// @route:       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access:      Private
exports.getBootcampInRadius = asyncHandler( async (req, res, next) => {
    // res.send(`Delete of bootcamp id: ${req.params.id}`);
    const { zipcode, distance } = req.params;
    // Get lat and log of zipcode from geocoder
    const loc = await geocode.geocode({ zipcode: zipcode});
    const [lat, lng] = [loc[0].latitude,loc[0].longitude];

    // Calc radius using radian
    // Divide distance by Earth radius
    // Earth radius = 3963 mi | 6378 km

    const radius = distance / 3963;

    // console.log(`geocode result:\n latitude:${lat}\n longitude:${lng}\n radius:${radius}`);

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: {
            $centerSphere: [[lng, lat], radius]
        }}
    });

    if(!bootcamps) return next( new ErrorResponse(`Bootcamp not Found within ZipCode: ${req.params.zipcode} and Distance: ${req.params.distance}`, 404));

    return res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
   
});


// @description: Upload Photo for bootcamp id
// @route:       Upload /api/v1/bootcamps/:id/photo
// @access:      Private
exports.uploadPhotoToBootcamp = asyncHandler( async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next( new ErrorResponse(`Bootcamp not Found with ID: ${req.params.id}`, 404));
    }

    // Make sure user is the bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User has no permission to delete bootcamp`, 401));
    }

    if(!req.files) {
        return next( new ErrorResponse(`Please Upload file`, 404));
    }

    const file = req.files.file;

    // Make sure the file is an image
    if(!file.mimetype.startsWith('image')) {
        return next( new ErrorResponse(`Please Upload an Image File`, 400));
    }

    // Check File Max Size:
    if(file.size > process.env.FILE_UPLOAD_MAX) {
        return next( new ErrorResponse(`Please Upload an Image less than ${process.env.FILE_UPLOAD_MAX}`, 400));
    }

    // Create Custom File Name:
    file.name = `photo-${bootcamp._id}${path.parse(file.name).ext}`;

    // Upload File to public/uploads folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if(err){
            console.error('File upload Error:\n',err);
            return next( new ErrorResponse(`Problem with the file uploaded:\n${err}`, 500));
        }
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    });
    console.log(file);
    
    res.status(200).json({ success: true, data: file.name });
});