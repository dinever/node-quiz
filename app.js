var express = require('express');
var http = require('http');
var mongoose = require('mongoose');

var app = express();

app.configure(function(){
    app.set('port', 8080);
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');
    app.locals.pretty = true;
    //	app.use(express.favicon());
    //	app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'super-duper-secret-secret' }));
    app.use(express.methodOverride());
    app.use(express.static(__dirname + "/public"));
});

var models = {};
models.Question = require('./models/question').(mongoose).model;

require('./routes')(app, models);

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server started, listening on port ' + app.get('port'));
});