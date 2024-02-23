// data.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  audio: {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    }
  },
});

// Create a Mongoose model using the schema
const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;
