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

    app.get("/:courseUrl/play", function(req, res) {
        models.Course.findOne({url: req.params.courseUrl}, function(err, course){
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
};