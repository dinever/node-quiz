module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var schema = new Schema({
        user: ObjectId,
        course: ObjectId,
        step: Number,
        lastQuestion: ObjectId,
        repeatStep: {}
    });

    this.model = mongoose.model('userStatus', schema);

    return this;
};
