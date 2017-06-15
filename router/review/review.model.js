const ReviewSchema = require('../../database/reviewSchema');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
ObjectId = mongoose.Types.ObjectId;
const UserSchema = require('../../database/mongoUserSchema');
const multer = require('multer');

class Model{
}

Model.reviewLikeInfo = function(user_email, review){
    try{
        let myTastes = false;
        let like_users = review.like_users;
        for (let i = 0; i < like_users.length; i++){
            if(like_users[i]===user_email){
                myTastes = true;
            }
        }
        let info = {"like_num":like_users.length, "myTastes":myTastes};
        return (info);
    }catch (err){
        return err;
    }
};

Model.showMostLikeReviews = function() {
    return new Promise((resolve,reject)=> {
        ReviewSchema.aggregate([{"$project":{
            "_id":1,
            "pet_id":1,
            "like_users":1,
            "rating":1,
            "user_id":1,
            "feed_id":1,
            "good":1,
            "bad":1,
            "time_stamp":1,
            "pet_type":1,
            "resized_img":1,
            "length":{"$size": "$like_users"}}}
            , {"$sort":{"length":-1}}], (err, feed)=>{
            if(err) {
                reject(err);
            }
            else {
                resolve(feed);
            }
        })
    });
}

Model.sendReview = function(req, imgInfo, petInfo){
    return new Promise((resolve, reject)=>{
        try{
            let review = new ReviewSchema();
            review.good = req.body.good;
            review.bad = req.body.bad;

            if(imgInfo){
                review.resized_img = imgInfo.url;
                review.img_key = imgInfo.itemKey;
            }

            review.feed_id = req.body.feed_id;
            review.pet_id = parseInt(petInfo.pet_id);
            review.pet_type = petInfo.pet_type;
            //유저 정보로 user_id 가져오는 로직 추가
            review.user_id = req.user.email;
            review.rating = parseFloat(req.body.rating);
            resolve(review);
        }catch( error ){
            reject(error);
        }
    })
};

Model.showMyReviews = function(req){
    return new Promise((resolve, reject) =>{
        const user_info = req.user.eamil;
        let mongoUser = UserSchema.findOne({email: user_info});
        mongoUser.exec(function (err, user){
            if (err){
                reject(err);
            } else{
                resolve(ReviewSchema.find({'_id': { $in: user.my_reviews}}));
            }
        })
    })
};

Model.getLikeUsers = function(review_obj, user_info){
    return new Promise((resolve, reject) =>{
        ReviewSchema.find({'_id' : review_obj}, {$elemMatch: like_users})
            .sort({'time_stamp': -1}).exec(function(err, docs){
                if(err) {
                    reject(err);
                    return;
                }
                resolve(docs);
            });
    })
};

Model.isLiked = function(req) {
    return new Promise((resolve, reject) => {
        try {
            const reviewId = req.body.review_objId; //type obj id 로 되어야 하는지 체크>> 아니여도 됨
            let review = ReviewSchema.findOne({'_id': reviewId}, {like_users: 1})
            resolve(review);
        } catch (err) {
            reject(err);
        }

    })
}

Model.addLikedUsers = function(req, likeFlag){
    return new Promise((resolve, reject) =>{
        const reviewId = req.body.review_objId; //type obj id 로 되어야 하는지 체크>> 아니여도 됨
        const user_info = req.user.email;

        console.log("like 누른 유저 user_info: ",user_info);
        console.log(ObjectId(reviewId));
        console.log("likeFlag: ",likeFlag);

        if(!likeFlag){
            ReviewSchema.findOneAndUpdate({_id: reviewId},
                {$push: {"like_users" :  user_info}},
                {safe: true, upsert: true}) //safe upsert option 있어도 없어도 됨
                .exec(function(err, docs){
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        resolve("like");
                    }
                })
        }else{
            ReviewSchema.findOneAndUpdate({_id: reviewId},
                {$pull: {"like_users" :  user_info}},
                {safe: true, upsert: true}) //safe upsert option 있어도 없어도 됨
                .exec(function(err, docs){
                    if(err){
                        console.log(err);
                        reject(err);
                    }else{
                        resolve("unlike");
                    }
                })
        }

    })
};

Model.writeReview = function(review){
    return new Promise((resolve, reject)=>{
        try{
            let result  = review.save();
            resolve(result);
        }catch( error ){
            console.log(error);
            reject(error);
        }
    })
};

Model.addMyReview = function(user_email, review){
    return new Promise((resolve, reject)=>{
        UserSchema.findOneAndUpdate({email: user_email},
            {$push: {"my_reviews" : review._id}},
            {safe: true, upsert: true}) //safe upsert option 있어도 없어도 됨
            .exec(function(err, docs){
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve(docs);
                }
            })
    })
};

Model.showLatestReviews = function(){ // limit
    return new Promise((resolve, reject)=>{
        ReviewSchema.find()
            .sort({'time_stamp': -1}).exec(function(err, docs){
            if(err) {
                reject(err);
                return;
            }
            resolve(docs);
        })
    })
};

Model.deleteReview = function(review_id){

    return new Promise((resolve, reject) =>{
        let reviewData;
        ReviewSchema.find({_id: review_id})
            .exec(function(err, results){
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    reviewData = results;
                    ReviewSchema.remove({_id: review_id})
                        .exec(function(err){
                            if(err){
                                console.log(err);
                                reject(err);
                            }else{
                                resolve(reviewData);
                            }
                        })
                }
            })
    })
};

Model.deleteMyReview = function(review_id, email){
    return new Promise((resolve, reject) =>{
        const user_info = email;
        UserSchema.findOneAndUpdate({email: user_info},
            {$pull: {"my_reviews" : review_id}},
            {safe: true, upsert: true}) //safe upsert option 있어도 없어도 됨
            .exec(function(err, docs){
                if(err){
                    console.log(err);
                    reject(err);
                }else{
                    resolve("success");
                }
            })
    })
}
module.exports = Model;