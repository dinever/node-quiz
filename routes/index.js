module.exports = function(app, models){
    var title = "Node Quiz";

    app.get('/', function(req, res){
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
                res.render("goCourse.jade", {
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

    function setRepeatStep(question, step, repeatStep){
        if(repeatStep[step] != null){
            step ++;
            setRepeatStep(question, step, repeatStep)
        }else{
            repeatStep[step] = question;
        }
    }

    function setNextQuestion(status, question, nextQuestion, course, req, res){
        if (question.answers.correct == req.param('answer')) {
            if (nextQuestion) {
                var data = {
                    nextQuestion: setQuestion(nextQuestion),
                    correct: true
                };
                res.send(data);
            }
            else{
                res.send('nomorequestion');
            }
        }else{
            data = {
                nextQuestion: setQuestion(nextQuestion),
                correct: false,
                correctAnswer: question.answers.correct,
                explanation: question.explanation
            };
            res.send(data);
            models.answerLog.findOneAndUpdate({user: req.session.user._id, question: question}, {$inc: {mistakes: 1}, easinessFactor: 2.5}, {upsert: true}, function(err, answerlog){
                var q = 4;
                var EF = answerlog.easinessFactor+(0.1-(5-q)*(0.08+(5-q)*0.02));
                models.answerLog.findOneAndUpdate({user: req.session.user._id, question: question}, {easinessFactor: EF}, function(){
                    if(status.repeatStep == null){
                        repeatStep = {};
                    }else{
                        repeatStep = status.repeatStep;
                        for(var i in repeatStep){
                            if(repeatStep.hasOwnProperty(i) && repeatStep[i] == question.id){
                                delete repeatStep[i];
                            }else{
                            }
                        }
                    }
                    restep = [2, 7, 14, 33, 78, 195];
                    for(i = 0; i < restep.length; i++){
                        step = restep[i] + status.step;
                        setRepeatStep(question._id, step, repeatStep);
                    }
                    models.userStatus.findOneAndUpdate({user: req.session.user._id, course: course}, {repeatStep: repeatStep}, {upsert: true}, function(err, status){

                    });
                });
            });
        }
    }

    app.post('/course/:courseURL/answer', authenticate, function(req, res) {
        var qid = req.param('id');
        models.Course.findOne({url: req.params.courseURL}, function(err, course){
            models.Question.findById(qid, function (err, question) {
                models.userStatus.findOneAndUpdate({user: req.session.user._id, course: course}, {$inc: {step: 1}}, {upsert: true}, function(err, status){
                    var currentStep = status.step;
                    if(status.repeatStep == null){
                        status.repeatStep = {};
                    }
                    if(status.repeatStep[currentStep] != null){
                        console.log(status.repeatStep[currentStep]);
                        models.Question.findById(status.repeatStep[currentStep], function(err, nextQuestion){
                            setNextQuestion(status, question, nextQuestion, course, req, res);
                        });
                    }else{
                        models.Question.findOne().where('_id').gt(question._id).exec(function(err, nextQuestion) {
                            setNextQuestion(status, question, nextQuestion, course, req, res);
                        });
                     }
                });
            });

        });

    });
};