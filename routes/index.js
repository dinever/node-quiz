module.exports = function(app, models){
    var title = "Node Quiz";

    app.get('/', function(req, res){
        console.log(req.session.user);
        res.render('index', {
            title: title,
            user: req.session.user
        });
    });

    var authenticate = function (req, res, next) {
        if(req.session.user){
            next();
        }else{
            res.redirect('/admin/login');
        }
    };

    function setQuestion(question){
        data = {
            title: question.title,
            id: question.id,
            answers: []
        };
        var answerCounts = 4;
        for (var i = 0, ar = []; i < answerCounts; i++) {
            ar[i] = i;
        }
        ar.sort(function () {
            return Math.random() - 0.5;
        });
        for (i = 0; i < ar.length; i++) {
            if(ar[i] == ar.length - 1){
                data.answers.push(question.answers['correct']);
            }else{
                data.answers.push(question.answers['incorrect'][ar[i]]);
            }
        }
        return data;
    }

    app.get('/course', authenticate, function(req, res){
        models.Course.find(function(err, courses){
            res.render('courses', {
                courses: courses
            });
        });
    });

    app.get('/course/:courseURL', authenticate, function(req, res){
        var url = req.params.courseURL;
        models.Course.findOne({url: url}, function(err, course){
            models.userStatus.find({user: req.session.user._id, course: course._id}, function(err, result){
                if(result != null){
                    res.render('courseDetail', { course: course, joined: true});//TODO: Need courseDetail view
                }else{
                    res.render('courseDetail', { course: course, joined: false});
                }
            });
        });
    });

    app.post('/course/:courseURL/join', authenticate, function(req, res){
        var url = req.params.courseURL;
        checkUser(req, res);
        models.Course.findOne({url: url}, function(err, course){
            models.userStatus.findOne({user: req.params.user.id, course: course.id}, function(err, status){
                if(status == null){
                    new models.userStatus({user: req.params.user._id, course: course.id, step: 1, repeatStep: []}).save();
                    res.send('ok');
                }else{
                    res.send('already_joined');
                }
            });
        });
    });

    app.get("/course/:courseURL/go", authenticate, function(req, res) {
        models.Course.findOne({url: req.params.courseURL}, function(err, course){
            models.Question.find({course: course._id}, function(err, questions) {
                var question = questions[0];
                question = setQuestion(question);
                res.render("play_question.jade", {
                    title: title,
                    question: question.title + " ?",
                    answer1: question.answers[0],
                    answer2: question.answers[1],
                    answer3: question.answers[2],
                    answer4: question.answers[3],
                    id: question.id
                });
            });
        });
    });

    app.post('/course/:courseURL/answer', authenticate, function(req, res) {
        console.log('haha');
        var qid = req.param('id');
        models.Question.findById(qid, function (err, question) {
            if (question.answers.correct == req.param('answer')) {
                models.Question.findOne().where('_id').gt(question._id).exec( function (err, nextQuestion) {
                    if (err) { throw err; }
                    if (nextQuestion) {
                        res.send(setQuestion(nextQuestion));
                    }
                    else{
                        res.send('nomorequestion');
                    }
                });
            }else{
                models.answerLog.findOneAndUpdate({user: req.session.user._id, question: question}, {$inc: { mistakes: 1}, easinessFactor: 2.5}, {upsert: true}, function(err, answerlog){
                    console.log(answerlog);
                res.send('wrong');
                });
            }
        })
    });
};