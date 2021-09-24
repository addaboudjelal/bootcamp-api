const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Course = require('../models/Courses');
const Bootcamp = require('../models/Bootcamps');
// @description: GET all courses
// @route:       GET /api/v1/courses
// @route:       GET /api/v1/bootcamps/:bootcampId/courses
// @access:      Public

exports.getCourses = asyncHandler( async (req, res, next) => {
    let query;

    if(req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId});
        const courses = await query;
    
        if(!courses) return next( new ErrorResponse('bal bla', 404));
        return res.status(200).json({
            success: true,
            data: courses
        })
    }


    res.status(200).json(res.advancedResults);

    
});

// @description: GET single course
// @route:       GET /api/v1/courses/:id
// @access:      Public

exports.getCourse = asyncHandler( async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if(!course) return next( new ErrorResponse(`No Course Found with the ID: ${req.params.id}`), 404);

    res.status(200).json({
        success: true,
        data: course
    });

    
});
// @description: Add single course
// @route:       POST /api/v1/courses
// @route:       POST /api/v1/bootcamps/:bootcampId/courses
// @access:      Private

exports.addCourse = asyncHandler( async (req, res, next) => {
    req.body.user = req.user.id;
    if(req.params.bootcampId){
        req.body.bootcamp = req.params.bootcampId;
    }

    const bootcamp = await Bootcamp.findById(req.body.bootcamp);

    if(!bootcamp) return next( new ErrorResponse(`No Bootcamp Found with the ID: ${req.params.bootcamp}`), 404);

    // Make sure user is the bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User ${req.user.id} is not authorize to add a course to bootcamp user ${bootcamp.user.toString()}`, 401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });

    
});

// @description: Update a course
// @route:      PUT /api/v1/courses/:id
// @route:      PUT /api/v1/bootcamps/:bootcampId/courses/:id
// @access:     PRIVATE

exports.updateCourse = asyncHandler( async(req, res, next) => {

    if(req.params.bootcampId){
        req.body.bootcamp = req.params.bootcampId;
    }

    const bootcamp = await Bootcamp.findById(req.body.bootcamp);

    if(!bootcamp) return next( new ErrorResponse(`No Bootcamp Found with the ID: ${req.body.bootcamp}`), 404);

     // Make sure user is the bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User ${req.user.id} is not authorize to update a course to bootcamp user ${bootcamp.user.toString()}`, 401));
    }

    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});

    if(!course) return next( new ErrorResponse(`No Course Found with the ID: ${req.params.id} for the Bootcamp ID: ${req.body.bootcamp}`), 404);


    res.status(200).json({
        success: true,
        data: course
    });
    
});

// @description: Delete a course
// @route:      DELETE /api/v1/courses/:id
// @route:      DELETE /api/v1/bootcamps/:bootcampId/courses/:id
// @access:     PRIVATE

exports.deleteCourse = asyncHandler( async(req, res, next) => {

    if(req.params.bootcampId){
        req.body.bootcamp = req.params.bootcampId;
        const bootcamp = await Bootcamp.findById(req.body.bootcamp);
        if(!bootcamp) return next( new ErrorResponse(`No Bootcamp Found with the ID: ${req.params.bootcamp}`), 404);
    }

    const course = await Course.findByIdAndDelete(req.params.id);

    if(!course) return next( new ErrorResponse(`No Course Found with the ID: ${req.params.id} ${req.params.bootcampId ? `for the Bootcamp ID: ${req.params.bootcampId}` : ``}`), 404);

    // Make sure user is the bootcamp owner
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next( new ErrorResponse(`User ${req.user.id} is not authorize to update a course to bootcamp user ${bootcamp.user.toString()}`, 401));
    }

    res.status(200).json({
        success: true,
        message: 'Course Removed'
    });
    
});