var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const conn = require('../dbConnections/mongoDbConfig');

if (mongoose.connection.readyState < 1)
    conn.connect();

let FeedSchema = new mongoose.Schema({
    BRAND_ID: {type: Number},
    CHECKPOINTS: {type: Array},
    FULLNAME: {type: String},
    TARGET_SIZE: {type: String},  //추후변경
    TARGET_AGE: {type: String},     //추후변경
    FEED_ID: {type: String}, //필요 없음
    NAME: {type: String},
    HUMIDITY: {type: String},
    TYPE: {type: String},       //추후변경
    IS_SNACK: {type: String},
    INGREDIENTS_INDEX: {type: Array},
    INGREDIENTS: {type: Array},
    GRAIN_SIZE: {type: Number},
    PRICE: {type: Number},
    ORIGIN: {type: String},
    MANUFACTURE: {type: String},
    NUTRITIONS: {type: Array},
    NUTRITIONS_INDEX: {type: Array},
    UNIT: {type: Array},
    PACKAGE: {type: Array},
    RATING: {type: Number},
    REVIEW_NUM: {type: Number},
    INDEX: {type: Number},
    IMAGE_URL : {type: String},
    ALLERGY_LISTS : {type: Array}
});

module.exports = mongoose.model('FEEDS',FeedSchema,'FEEDS');