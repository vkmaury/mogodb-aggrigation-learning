// models/Listing.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
    property_type: String,
    name:String,
    // Add other fields as needed
});

module.exports = mongoose.model('Listing', ListingSchema, 'Airbnb'); // 'airbnb' is the collection name
