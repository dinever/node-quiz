module.exports = function(mongoose) {
    var Schema = mongoose.Schema;

    var schema = new Schema({
        title: String,
        url: String,
        description: String,
        entered: {type: Date, default: Date.now}
    });

    this.model = mongoose.model('Course', schema);

    return this;
};
