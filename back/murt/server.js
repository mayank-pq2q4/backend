var express = require("express")
var cors = require('cors')
var app = express()
app.use(express.json(), cors())

var routes = require("./api/routes")
routes(app)
app.use('*', function(req, res){
    res.json({status: "undefined route"}, 404)
  });
  
var port = process.env.port || 3005

app.listen(port, () => {
    console.log("Server started on port " + port)
})