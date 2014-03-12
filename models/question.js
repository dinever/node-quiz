module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var schema = new Schema({
        title: String,
        course: ObjectId,
        answers: {
            correct: String,
            incorrect: [String] },
        explanation: String,
        entered: {type: Date, default: Date.now}
    });

    this.model = mongoose.model('Question', schema);

    return this;
};
