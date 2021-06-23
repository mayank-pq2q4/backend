'use strict'

const controller = require('./controller')

module.exports = function(app){
    app.route('/analyseTweet/:hashtag').get(controller.AnalyseTweet)
    app.route('/analyseTweet/:hashtag').put(controller.AnalyseAndStore)
    app.route('/getAnalysis/:hashtag').get(controller.SendAnalysis)
    
} 