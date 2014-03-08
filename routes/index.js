module.exports = function(app, model){
    var title = "Node Quiz";

    app.get('/', function(req, res){
        res.render('index', {
            title: title
        });
    });
};