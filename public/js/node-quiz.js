$(function() {
    var totalSeconds = 30;
    var seconds = totalSeconds;

    var myTimer = setInterval(function() {
        var width = seconds<30 ? (10 * seconds / 30) * 10 : 100;

        seconds -= 0.10;

        if (seconds <= 0) {
            clearInterval(myTimer);
            width = 0;
            seconds = 0;
        } else if (seconds <= 10) {

        }

        $('.bar').css('width', width + '%');
    }, 100);

    function getNextQuestion (){
        console.log(totalSeconds);
        console.log(seconds);
        var qid = $("#play").attr("qid");
        $.ajax({
            type: "POST",
            data: {
                "id": qid,
                "answer": this.value,
                "responseTime": totalSeconds - seconds,
                "totalTime": totalSeconds
            },
            success: function(data) {
                if (data == 'nomorequestion') {
                    alert('correct!');
                    alert('no more questions!');
                }
                else{
                    if(data != 'wrong'){
                        setQuestion(data.nextQuestion);
                    }else{
                        alert('wrong answer!');
                        setQuestion(data.nextQuestion);
                    }
                }
            },
            url: './answer'
        });
    }

    $('.answer').on('click', getNextQuestion);

    function setQuestion(data){
        var form = $("<form></form>").attr('id', 'play').attr('qid', data.id);
        form.append("<legend>" + data.title + "</legend>");
        for(var i = 0; i < data.answers.length; i++ )
        {
            var input = $('<input class="btn btn-default btn-block btn-flat answer" type="button"/>').attr('name', 'answer'+i).attr('value', data.answers[i]);
            form.append(input);
        }
        form.children('.answer').on('click', getNextQuestion);
        $("#question").html(form);
    }

});