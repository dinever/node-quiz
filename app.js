var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var app = express();

var config = require("./config")(app, express);

app.configure("development", function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    mongoose.connect("mongodb://localhost/quizBank");
});

var models = {};
models.Question = require('./models/question')(mongoose).model;
models.User = require('./models/user')(mongoose).model;
models.Course = require('./models/course')(mongoose).model;
models.answerLog = require('./models/answerLog')(mongoose).model;
models.userStep = require('./models/userStatus')(mongoose).model;

require('./routes')(app, models);
require('./routes/admin')(app, models);

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server started, listening on port ' + app.get('port'));
});