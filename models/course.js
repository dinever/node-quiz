module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    var schema = new Schema({
        title: String,
        description: String,
        entered: {type: Date, default: Date.now}
    });

    this.model = mongoose.model('Question', schema);

    return this;
};
