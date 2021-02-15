var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "your_mongodb_url";

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
    if (err)
        throw err;
    var dbo = db.db("irc_db");
    dbo.collection("messages").deleteMany(function(err) {
        if (err)
            throw err;
        db.close();
    });
});
