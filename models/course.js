module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    var schema = new Schema({
        title: String,
        url: String,
        description: String,
        questionCount: Number,
        entered: {type: Date, default: Date.now}
    });

    this.model = mongoose.model('Course', schema);

    this.model.updateQuestionCount = function(courseId, questions){
        var course = this;
        questions.count({}, function( err, count){
            course.update({_id: courseId}, {questionCount: count})
        })
    };

    return this;
};
