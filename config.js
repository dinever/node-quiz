module.exports = function(app, express, mongoose){
    var config = this;

    app.configure(function(){
        app.set('port', 8080);
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.locals.pretty = true;
        //	app.use(express.favicon());
        //	app.use(express.logger('dev'));
        app.use(express.urlencoded());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'super-duper-secret-secret' }));
        app.use(express.methodOverride());
        app.use(express.static(__dirname + "/public"));
    });
};