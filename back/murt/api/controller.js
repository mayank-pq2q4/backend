'use strict'

var properties = require('../package.json')
var Sentiment = require('sentiment')
var sentiment = new Sentiment
const {MongoClient} = require('mongodb')
var routes = require('./routes')


const needle = require('needle');
const { json } = require('express');


const token = "";

const endpointUrl = "https://api.twitter.com/2/tweets/search/recent";


async function getRequest(hashtag) {

    const params = {
        'query': hashtag,
        'expansions': 'author_id',
        'tweet.fields': 'author_id',
        'user.fields': 'location',
        'max_results': 50
    }

    const res = await needle('get', endpointUrl, params, {
        headers: {
            "User-Agent": "v2RecentSearchJS",
            "authorization": `Bearer ${token}`
        }
    })

    if (res.body) {
        return res.body;
    } else {
        throw new Error('Unsuccessful request');
    }
}

function TweetSentiment(tweets){
    var data = []
    tweets.data.forEach(tweet => {
        var senti = sentiment.analyze(tweet.text)
        tweet.score = senti.score
        data.push(tweet)
        // console.log(senti.score)
        
    });
    return data
}

function ParseRequest(ResTweets){
    ResTweets.data.forEach((Tweet) => {
        ResTweets.includes.users.forEach((Ting) => {
            if(Tweet.author_id == Ting.id){
                Tweet.name = Ting.name;
                if(Ting.location){
                    Tweet.location = Ting.location;
                }
            }
        })
    })
    return ResTweets;
}

async function CollExist(collname, client, hashtag){
        var temp = []
        await client.db("Twitter").listCollections().forEach((collinfo, err) => {
            // console.log(collinfo)
            temp.push(collinfo.name)
        });
        // console.log(temp)
        if(temp.includes(hashtag)){
            return 1
        }
        else{
            return 0
        }
}



var controllers = {
    AnalyseTweet: async function(req, res){
        try {
            // Make request
            const responseting = await getRequest(req.params.hashtag);
            var newresponseting = ParseRequest(responseting)
            var tweetcollection = TweetSentiment(newresponseting)
            res.json({'hashtag': req.params.hashtag, 'data': tweetcollection})
    
        } catch (e) {
            console.log(e);
            process.exit(-1);
        }

    },


    AnalyseAndStore: async function(req, res){
        const uri = "mongodb://@cluster0-shard-00-00.oijgn.mongodb.net:27017,cluster0-shard-00-01.oijgn.mongodb.net:27017,cluster0-shard-00-02.oijgn.mongodb.net:27017/test?ssl=true&replicaSet=atlas-10h54w-shard-0&authSource=admin&retryWrites=true&w=majority"
        const client = new MongoClient(uri);
        try {
            // Make request
            const responseting = await getRequest(req.params.hashtag);
            var newresponseting = ParseRequest(responseting)
            var tweetcollection = TweetSentiment(newresponseting)
            console.log(newresponseting)
            await client.connect();
                client.db("Twitter").createCollection(req.params.hashtag).catch((err) => {})
            tweetcollection.forEach(tweet => {
                client.db("Twitter").collection(req.params.hashtag).insertOne({tweet}) 
            });
            //Make call to add to Database service too
    
            //run the query to search for duplicates on twitter id and delete
            
            client.db("Twitter").collection(req.params.hashtag).aggregate([
                    {
                      '$group': {
                        '_id': '$tweet.author_id',
                        'total': {
                          '$sum': 1
                        }
                    }
                    },
                      {'$match': {
                        'total': {
                          '$gt': 1
                        }
                      }
                      }
            ]).forEach(async function(data){
                if(data.total > 1){
                    for(var i = 0; i < data.total - 1; i++){
                        await client.db("Twitter").collection(req.params.hashtag).deleteOne({"tweet.author_id" : data._id})
                    }

                }
            })
        
        } catch (e) {
            console.log(e);
            process.exit(-1);
        }
        res.json({"status": "successfully updated"})
    },
    SendAnalysis: async function(req, res){
        const uri = "mongodb://@cluster0-shard-00-00.oijgn.mongodb.net:27017,cluster0-shard-00-01.oijgn.mongodb.net:27017,cluster0-shard-00-02.oijgn.mongodb.net:27017/test?ssl=true&replicaSet=atlas-10h54w-shard-0&authSource=admin&retryWrites=true&w=majority"
        const client = new MongoClient(uri);
        await client.connect()
        
        if(await CollExist(req.params.hashtag, client, req.params.hashtag)){
            // console.log("ting")
            var tweets = []
            await client.db("Twitter").collection(req.params.hashtag).find().forEach((tweet) => {
                // console.log(tweet)
                tweets.push(tweet)
            })
            // console.log(tweets)
            res.json({tweets})
        }
        else{
            try {
                // Make request
                const responseting = await getRequest(req.params.hashtag);
                var newresponseting = ParseRequest(responseting)
                var tweetcollection = TweetSentiment(newresponseting)
                res.json({'hashtag': req.params.hashtag, 'data': tweetcollection})
        
            } catch (e) {
                console.log(e);
                process.exit(-1);
            }
        }
    }
}

module.exports = controllers