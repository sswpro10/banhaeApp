var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var userSchema = new mongoose.Schema({
    email : String, //mysql 검색용
    my_reviews : Array, //리뷰 obj _id
    my_tastes : Array //id + 좋아요한 review obj _id저장, count로 좋아요 갯수
});

module.exports = mongoose.model('USER', userSchema);