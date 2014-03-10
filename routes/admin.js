module.exports = function(app, models){
    var title = 'haha';
    var adminURL = '/admin';
    app.get(adminURL + '/login', function(req, res) {
        res.render("login.jade");
    });

    app.post(adminURL + '/login', function(req, res) {
        req.method = "get";
        models.User.findOne({username: req.body.username, password:req.body.password}, function(err, user){
            if(user != null){
                req.session.user = user;
                res.redirect(adminURL + '/');
            }else{
                res.redirect(adminURL + '/login');
            }
        });
    });

    app.get(adminURL + '/register', function(req, res){
        res.render('register', { errs : {}});
    });

    app.post(adminURL + '/register', function(req, res){
        if( req.body.password != req.body.repassword){
            res.render('register', {errs: { password: 'Password not match, please try again.'}})
        }else{
            var user = {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            };
            models.User.addNewAccount(user, function (error){
                if(error){
                    res.render('register', error);
                }else{
                    req.session.user = user.username;
                    res.redirect(adminURL + '/');
                }
            });
        }
    });

    app.get(adminURL + '/', function(req, res) {
        if(!req.session.user) {
            req.session.originalRoute = req.path;
            res.redirect(adminURL + '/login');
            return;
        }
        models.Question.find(function(err, questions) {
            res.render('viewQuestions', {
                title: title,
                questions: questions
            });
        });
    });

    app.get(adminURL + '/createQuestion', function(req, res) {
        res.render('createQuestion');
    });

    app.post(adminURL + "/submitQuestion", function(req, res) {
        var title = req.body.question;
        var correctAnswer = req.body.correctAnswer;
        var wrongAnswers = [req.body.wrongAnswer1,
            req.body.wrongAnswer2, req.body.wrongAnswer3];
        new models.Question({
            title: title,
            answers: { correct: correctAnswer, incorrect: wrongAnswers}
        }).save();

        req.method = "get";
        res.redirect(adminURL + "/createQuestion");
    });

    app.get(adminURL + '/createCourse', function(req, res){
        res.render('createCourse');
    });

    app.post(adminURL + '/createCourse', function(req, res){
        var title = req.body.title;
        var description = req.body.description;
        new models.Course({
            title: title,
            description: description
        });
        res.redirect(adminURL + '/');
    });
};