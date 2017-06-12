const express = require('express');
const FeedModel = require('./feed.model');
const FeedSearch = require('./feedSearch');
const router = express.Router();

router.get('/search', getFeedByName); // 사료 검색용
router.get('/mySearch', getMyFeeds); // 맞춤 검색용
router.get('/list', getFeedList);  //사료 목록 가져오기
router.get('/:feed_id', getFeedByID);  //사료 상세보기
router.post('/', addFeed); //사료 추가하기
router.put('/:feed_id', updateFeed); //사료 수정하기
router.delete('/:feed_id', deleteFeed); //사료 삭제하기

async function getMyFeeds(req, res){
    try{
        const tempId = "asdf@gmail.com"; //토큰 정보로
        let petInfo = await FeedSearch.getMyPetInfo(tempId);

        const weight = petInfo[0].weight;
        const birthday = petInfo[0].birthday;
        const allergy = petInfo[0].allergy.split(';');

        for (let i = 0; i < allergy.length; i++)
            allergy[i] = parseInt(allergy[i]);

        let size = "ALL";
        if(weight < 5){
            size = "소형견";
        }else if(weight < 20){
            size = "중형견";
        }else{
            size = "대형견";
        }

        let age = "퍼피"; //birthday 계산 추가

        let type = "주식용";//req.query.type;
        let humidity = "건사료";//req.query.humidity;
        let priceMin = 500;//req.query.priceMin; //parseFloat
        let priceMax = 170000;//req.query.priceMax; //parseFloat

        let page = 1;
        if (req.query.page)
            page = req.query.page;
        const feedsPerpage = 5;
        const mySearch = {allergy, type, humidity, priceMin, priceMax, size, age};
        let myFeedsSearch = await FeedSearch.myFeedsSearch(mySearch);

        let noAllergy = [];
        for (let i = 0; i < myFeedsSearch.length; i++){
            if (myFeedsSearch[i].allergyCount === 0){
                noAllergy.push(myFeedsSearch[i]);
            }
        }

        let pages = (noAllergy.length)/feedsPerpage;
        let startPage = (page-1)*5;
        let endPage = page*5;

        let result = [];
        if (pages >= page||page === 1){
            for (let i = startPage; i < endPage; i++){
                result.push(noAllergy[i]);
            }
            res.send(noAllergy);
        }else{
            res.send("검색 결과 없음");
        }

    }catch(err){
        console.log(err);
        res.status(500).send({msg:err.msg});
    }
}

//사료 이름 목록 가져오기
async function getFeedList(req, res) {
    try {
        const feed = await FeedModel.getFeedList();
        let result = {count:feed.length, data:feed, msg:"getFeedList 성공" };
        res.send(result);
    } catch (err) {
        res.status(500).send({msg:err.msg});
    }
}

async function getFeedByName(req, res) {
    try {
        // 요청값 체크
        let feed_name = req.query.keyword;
        let sort = req.query.sort;
        if(!feed_name) {
            res.status(400).send({"msg":"No Feed Name!!"})
            return;
        }
        //Model접근
        const feed = await FeedModel.getFeedByName(feed_name);
        //기타 처리 후 클라이언트 응답
        //sort 방법에 따라 sorting han, point, review
        if(sort === 'point') {
            feed.sort(function (a,b) {
                return a.RATING < b.RATING ? 1 : a.RATING > b.RATING ? -1 : 0;
            });
            //별점순
        } else if(sort === 'review') {
            //리뷰 많은순
            feed.sort(function (a,b) {
                return a.REVIEW_NUM < b.REVIEW_NUM ? 1 : a.REVIEW_NUM > b.REVIEW_NUM ? -1 : 0;
            });
        } else {
            //가나다순
            feed.sort(function (a,b) {
                return a.NAME < b.NAME ? -1 : a.NAME > b.NAME ? 1 : 0;
            });
        }

        let result = { data:feed, msg:"success" };
        res.send(result);
    } catch (err) {
        res.status(500).send({msg:err.msg});
    }
}

async function getFeedByID(req, res) {
    try {
        let feed_id = req.params.feed_id;
        if(!feed_id) {
            res.status(400).send({"msg":"No Feed ID!!"});
            return;
        }

        const feed = await FeedModel.getFeedByID(feed_id);
        let result = { data:feed, msg:"success" };
        res.send(result);
    } catch (err) {
        res.status(500).send({msg:err.msg});
    }
}

async function addFeed(req, res) {
    try {
        //입력 처리
        const feed = await FeedModel.addFeed();
        let result = { data:feed, msg:"success" };
        res.send(result);
    } catch (err) {
        res.status(500).send({msg:err.msg});
    }
}

async function updateFeed(req, res) {
    try {
        let feed_id = req.params.feed_id;
        if(!feed_id) {
            res.status(400).send({"msg":"No Feed ID!!"})
            return;
        }

        const feed = await FeedModel.updateFeed(feed_id);
        let result = { msg:"success" };
        res.send(result);
    } catch (err) {
        res.status(500).send({msg:err.msg});
    }
}

async function deleteFeed(req, res) {
    try {
        let feed_id = req.params.feed_id;
        if(!feed_id) {
            res.status(400).send({"msg":"No Feed ID!!"})
            return;
        }

        const feed = await FeedModel.deleteFeed(feed_id);
        let result = { msg:"success" };
        res.send(result);
    } catch (err) {
        res.status(500).send({msg:err.msg});
    }
}

module.exports = router;