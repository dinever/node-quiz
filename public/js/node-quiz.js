$(function() {
    $(".answer").click(function () {
        var qid = $("#play").attr("qid");
        console.log('click!');
        $.ajax({
            type: "POST",
            data: {
                "id": qid,
                "answer": this.value
            },
            success: function(data) {
                if (data == null) {
                    alert("no more questions!");
                }
                else{
                    var form = $("<form></form>").attr('qid', data.id);
                    form.append("<legend>" + data.title + "</legend>");
                    for(var i = 0; i < data.answers.length; i++ )
                    {
                        var input = $('<input class="btn btn-large btn-block answer" type="button"/>').attr('name', 'answer'+i).attr('value', data.answers[i]);
                        form.append(input);
                    }
                    $("#question").html(form);
                    alert(data.title);
                }
            },
            url: '/answerQuestion'
        });
    });
});