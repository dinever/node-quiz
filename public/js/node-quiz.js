$(function() {

    function getNextQuestion (){
        var qid = $("#play").attr("qid");
        $.ajax({
            type: "POST",
            data: {
                "id": qid,
                "answer": this.value
            },
            success: function(data) {
                if (data == 'nomorequestion') {
                    alert('correct!');
                    alert('no more questions!');
                }
                else{
                    if(data != 'wrong'){
                        setQuestion(data);
                    }else{
                        alert('wrong answer!');
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
            var input = $('<input class="btn btn-large btn-block answer" type="button"/>').attr('name', 'answer'+i).attr('value', data.answers[i]);
            form.append(input);
        }
        form.children('.answer').on('click', getNextQuestion);
        $("#question").html(form);
    }

});