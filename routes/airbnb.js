const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');

router.get('/search/airbnb', listingsController.searchListings);

module.exports = router;
