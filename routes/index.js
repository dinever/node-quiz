module.exports = function(app, models){
    var title = "Node Quiz";

    app.get('/', function(req, res){
        res.render('index', {
            title: title
        });
    });

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

    app.get("/play", function(req, res) {
        models.Question.find(function(err, questions) {
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

    app.post('/answerQuestion', function(req, res) {
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
                res.send('wrong');
            }
        })
    });

    app.get('/quizManager/login', function(req, res) {
        res.render("login.jade", {
            title: title
        });
    });

    app.post('/quizManager/login', function(req, res) {
        req.method = "get";
        models.User.findOne({username: req.body.username, password:req.body.password}, function(err, user){
            if(user != null){
                req.session.user = user;
                res.redirect('/quizManager/view');
            }else{
                res.redirect('/quizManager/login');
            }
        });
    });

    app.get('/quizManager/register', function(req, res){
        res.render('register', { errs : {}});
    });

    app.post('/quizManager/register', function(req, res){
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
                    res.redirect('/quizManager/view');
                }
            });
        }
    });

    app.get('/quizManager/view', function(req, res) {
        if(!req.session.user) {
            req.session.originalRoute = req.path;
            res.redirect('/quizManager/login');
            return;
        }
        models.Question.find(function(err, questions) {
            res.render('viewQuestions', {
                title: title,
                questions: questions
            });
        });
    });

    app.get('/quizManager/createQuestion', function(req, res) {
        res.render('createQuestion');
    });

    app.post("/quizManager/submitQuestion", function(req, res) {
        var title = req.body.question;
        var correctAnswer = req.body.correctAnswer;
        var wrongAnswers = [req.body.wrongAnswer1,
            req.body.wrongAnswer2, req.body.wrongAnswer3];
        new models.Question({
            title: title,
            answers: { correct: correctAnswer, incorrect: wrongAnswers}
        }).save();

        req.method = "get";
        res.redirect("/quizManager/createQuestion");
    });
};