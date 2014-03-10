module.exports = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var schema = new Schema({
        user: ObjectId,
        course: ObjectId,
        step: Number,
        repeatStep: {}
    });

    this.model = mongoose.model('userStep', schema);

    return this;
};
