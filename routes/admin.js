module.exports = function(app, models){
    var crypto = require('crypto');

    var adminURL = '/admin';

    var authenticate = function (req, res, next) {
        if(req.session.user){
            next();
        }else{
            res.redirect('/admin/login');
        }
    };

    var generateSalt = function()
    {
        var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
        var salt = '';
        for (var i = 0; i < 10; i++) {
            var p = Math.floor(Math.random() * set.length);
            salt += set[p];
        }
        return salt;
    };

    var md5 = function(str) {
        return crypto.createHash('md5').update(str).digest('hex');
    };

    var saltAndHash = function(pass, callback)
    {
        var salt = generateSalt();
        callback(salt + md5(pass + salt));
    };

    var validatePassword = function(plainPass, hashedPass, callback)
    {
        var salt = hashedPass.substr(0, 10);
        var validHash = salt + md5(plainPass + salt);
        callback(null, hashedPass === validHash);
    };

    app.get(adminURL + '/login', function(req, res) {
        res.render("login.jade");
    });

    app.post(adminURL + '/login', function(req, res) {
        req.method = "get";
        var username = req.body.username;
        var password = req.body.password;

        models.User.findOne({username: username}, function(err, user){
            if(user != null){
                validatePassword(password, user.password, function(err, o){
                    if(o){
                        req.session.user = user;
                        app.locals({
                            user: user
                        });
                        res.redirect(adminURL + '/');
                    }else{
                        res.render('login', {errs: {username: 'Wrong username or password'}});
                    }
                });
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
            saltAndHash(user.password, function(hash){
                user.password = hash;
                models.User.addNewAccount(user, function (error, result){
                    if(error){
                        res.render('register', error);
                    }else{
                        req.session.user = result;
                        res.redirect(adminURL + '/');
                    }
                });
            });
        }
    });

    app.get(adminURL + '/', authenticate, function(req, res) {
        models.Course.find(function(err, courses) {
            models.User.find(function(err, users){
                res.render('admin', {
                    courses: courses,
                    users: users
                });
            });
        });
    });

    app.get(adminURL + '/createQuestion', authenticate, function(req, res) {
        models.Course.find(function(err, courses){
            res.render('createQuestion', {
                courses: courses
            });
        });
    });

    app.post(adminURL + "/submitQuestion", authenticate, function(req, res) {
        var title = req.body.question;
        var courseId = '531d5d831a60fa2241afb654'; //TODO
        var correctAnswer = req.body.correctAnswer;
        var wrongAnswers = [req.body.wrongAnswer1,
            req.body.wrongAnswer2, req.body.wrongAnswer3];
        new models.Question({
            title: title,
            course: courseId,
            answers: { correct: correctAnswer, incorrect: wrongAnswers}
        }).save();

        models.Question.count({}, function(err, count){
                models.Course.findByIdAndUpdate(courseId, { 'questionCount': count}, 'new', function(err, course){
                    console.log(course);
                });
            });

        req.method = "get";
        res.redirect(adminURL + "/createQuestion");
    });

    app.get(adminURL + '/createCourse', authenticate, function(req, res){
        res.render('createCourse');
    });

    app.post(adminURL + '/createCourse', authenticate, function(req, res){
        var title = req.body.title;
        var description = req.body.description;
        var url = req.body.url;
        new models.Course({
            title: title,
            url: url,
            description: description
        }).save();
        req.method = 'get';
        res.redirect(adminURL + '/');
    });

    app.get(adminURL + '/:course', authenticate, function(req, res){
        models.Course.findOne({url: req.params.course}, function(err, course){
            models.Question.find({course: course._id}, function (err, questions){
                res.render('viewQuestions', { questions: questions});
            });
        });
    });
};