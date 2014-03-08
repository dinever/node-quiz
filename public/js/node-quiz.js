$(function() {
    $(".answer").click(function () {
        var qid = $("#play").attr("qid");
        console.log(this.value);
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
                    alert(data.title);
                    $("#play").children("legend").html(data.title);
                }
            },
            url: '/answerQuestion'
        });
    });
});