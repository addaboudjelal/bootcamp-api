const express = require('express');
const { getBootcamp, getBootcamps, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampInRadius, uploadPhotoToBootcamp } = require('../controllers/bootcamps');
const router = express.Router();
// Import middleware and Model:
const Bootcamp = require('../models/Bootcamps');
const advancedResults = require('../middleware/advancedResults');

//Import middleware that check token user existence:
const { protect, authorize } = require('../middleware/auth');

// Include other resource routers
const courseRouter = require('./courses');
// Re-route into other resource routers:
router.use('/:bootcampId/courses', courseRouter);

router.route('/').get(advancedResults(Bootcamp, 'courses') ,getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id').get(getBootcamp).put(protect, authorize('publisher', 'admin'),updateBootcamp).delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), uploadPhotoToBootcamp);

// router.get(`/`, (req, res) => {
//     res.send('List all bootcamp');
// });

// router.get(`/:id`, (req, res) => {
//     res.send(`get bootcamp id: ${req.params.id}`);
// });

// router.post(`/`, (req, res) => {
//     res.send('add new bootcamp');
// });

// router.put(`/:id`, (req, res) => {
//     res.send(`update of bootcamp id: ${req.params.id}`);
// });

// router.delete(`/:id`, (req, res) => {
//     res.send(`delete of bootcamp id: ${req.params.id}`);
// });


module.exports = router;