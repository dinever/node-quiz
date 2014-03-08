module.exports = function(app, models){
    var title = "Node Quiz";

    app.get('/', function(req, res){
        res.render('index', {
            title: title
        });
    });

    app.get("/play", function(req, res) {
        models.Question.find(function(err, questions) {
            var question = questions[0];
            res.render("play_question.jade", {
                title: title,
                question: question.title + " ?",
                answer1: question.answers["correct"],
                answer2: question.answers["incorrect"][0],
                answer3: question.answers["incorrect"][1],
                answer4: question.answers["incorrect"][2],
                id: question._id
            });
        });
    });

};