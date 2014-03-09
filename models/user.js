module.exports = function(mongoose){
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var schema = new Schema({
        username: String,
        email: String,
        password: String
    });

    this.model = mongoose.model('User', schema);

    this.model.addNewAccount = function(newData, callback)
    {
        var user = this;
        user.findOne({username: newData.username}, function(e, o) {
            if (o){
                callback({errs: { username: 'Username been taken, please choose another.'}});
            }	else{
                user.findOne({email: newData.email}, function(e, o) {
                    if (o){
                        callback({errs: { email: 'Please use a valid email address.'}});
                    }else{
                        new user(newData).save();
                        callback(null);
                    }
                });
            }
        });
    };

    return this;
};

