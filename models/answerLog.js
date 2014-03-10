module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var schema = new Schema({
        user: ObjectId,
        question: ObjectId,
        easinessFactor: Number,
        mistakes: Number
    });

    this.model = mongoose.model('answerLog', schema);

    return this;
};