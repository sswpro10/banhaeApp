const express = require('express');
const reviewModel = require('./review.model');
const imgUp = require('../../model/imgUpload');
const FeedModel = require('../feed/feed.model');
const multer = require('multer');
const upload = multer({
    dest : 'tmp'
});

var router = express.Router();

router.route('/likes')
    .post(likeReview);

router.route('/')
    .get(showReviews);

router.route('/myReviews')
    .get(showMyReviews);

router.route('/:review_id')
    .delete(deleteReview);

router.post('/', upload.any(), writeReview);

async function writeReview(req, res) {
    try{
        let file;
        let s3Path;
        if (req.files){
            file = req.files[0];
            let sizeTest = await imgUp.sizeTest(file);
            let ratio = 5;
            let width = sizeTest.data.width/ratio;
            let height = sizeTest.data.height/ratio;
            let resized = await imgUp.resizingImg(file, width, height);
            let directory = 'reviews';
            s3Path = await imgUp.s3Upload(file, directory); //s3Path.url ,s3Path.folder
            let del = await imgUp.deleteLocalFile(file);
        }// 사진 사이즈에 맞게 비율로 조정, 리뷰에 맞는 사이즈 받기

        let reviewData = await reviewModel.sendReview(req, s3Path);
        let writeReview = await reviewModel.writeReview(reviewData);
        await reviewModel.addMyReview(reviewData); // 몽고 user collection schema 정의 후 내가 쓴 리뷰에 추가
        //사료 콜렉션에 있는 Review_Num 컬럼 변경
        await FeedModel.updateReviewNum(reviewData.feed_id, 0);  //0이면 증가, 1이면 감소

        res.send({msg:"success", data: writeReview});
    } catch( error ){
        console.log(error);
        res.status(error.code).send({msg:error.msg});
    }
}

async function showMyReviews(req, res){
    try{
        let myReviews = await reviewModel.showMyReviews(req);
        res.send(myReviews);
    }catch (error){
        res.status(error.code).send({msg:error.msg});
    }
}

async function likeReview(req, res) {
    try{
        let review = await reviewModel.addLikedUsers(req);
        res.send(review);
    }catch(error){
        res.status(error.code).send({msg:error.msg});
    }
}

async function showReviews(req, res) {
    try{
        let showLatestReviews = await reviewModel.showLatestReviews();
        //review_objId도 보내줘야함
        res.send(showLatestReviews);
    } catch( error ){
        console.log(error);
        res.status(error.code).send({msg:error.msg});
    }
}

async function deleteReview(req, res) {

    try{
        let review_id = req.params.review_id;
        let reviewData = await reviewModel.deleteReview(review_id);

        imgUp.deleteS3(reviewData[0].img_key); //사진 삭제
        let deleteResult = await reviewModel.deleteMyReview(review_id); //디비 삭제
        //사료 콜렉션에 있는 Review_Num 컬럼 변경
        await FeedModel.updateReviewNum(reviewData[0].feed_id, 1);  //0이면 증가, 1이면 감소
        res.send(deleteResult);
    } catch( error ){
        console.log(error);
        res.status(error.code).send({msg:error.msg});
    }
}

module.exports = router;