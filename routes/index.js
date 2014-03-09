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
        if(req.body.username === "demo" && req.body.password === "demo"){
            res.redirect('/quizManager/');//req.session.originalRoute
            req.session.logged = true;
        } else {
            res.redirect('/quizManager/login');
        }
    });

    app.get('/quizManager/viewQuestions', function(req, res) {
        if(!req.session.logged) {
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


};