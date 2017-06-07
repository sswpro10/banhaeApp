var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const conn = require('../database/mongoDbConfig');

if (mongoose.connection.readyState < 1)
    conn.connect();

var FeedSchema = new mongoose.Schema({
    BRAND_ID: {type: Number},
    CHECKPOINTS: {type: Array},
    FULLNAME: {type: String},
    TARGET_SIZE: {type: String},  //추후변경
    TARGET_AGE: {type: String},     //추후변경
    NAME: {type: String},
    HUMIDITY: {type: String},
    TYPE: {type: String},       //추후변경
    IS_SNACK: {type: Boolean},
    INGREDIENTS_INDEX: {type: Array},
    INGREDIENTS: {type: Array},
    GRAIN_SIZE: {type: String},
    PRICE: {type: Number},
    ORIGIN: {type: String},
    MANUFACTURE: {type: String},
    NUTRITIONS: {type: Array},
    NUTRITIONS_INDEX: {type: Array},
    UNIT: {type: Array},
    PACKAGE: {type: Array},
    RATING: {type: Number},
    REVIEW_NUM: {type: Number}
});

module.exports = mongoose.model('FEEDS',FeedSchema,'FEEDS');