const { get_date } = require("../tools/my_date.js");

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var url = "your_mongodb_url";


var socket = {id: 'walou'};
function get_messages_db(new_socket) {
    socket = new_socket;
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
        if (err)
            throw err;
        var dbo = db.db("irc_db");
        dbo.collection("messages").find({}).toArray(function(err, messages) {
            if (err)
                throw err;
            db.close();
            if (messages.length > 0) {
                socket.emit('RECEIVE_MESSAGE', {
                    channel: "PRIVATE",
                    date: get_date(),
                    author_of_msg: 'Admin',
                    text: "*** OLD MESSAGES ***"
                });
                messages.forEach(message => {
                    socket.emit('RECEIVE_MESSAGE', {
                        channel: message.channel,
                        date: message.date,
                        author_of_msg: message.author_of_msg,
                        text: message.text
                    });
                });
                socket.emit('RECEIVE_MESSAGE', {
                    channel: "PRIVATE",
                    date: get_date(),
                    author_of_msg: 'Admin',
                    text: "*** END OF OLD MESSAGES ***"
                });
            }
        });
    });
}

let client;
function connect_to_db() {
    console.log("CONNECT TO THE DB");
    client = MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true});
    client.connect();
}

let new_messages = {}
function insert_messages_db(message_insert) {
    new_messages = message_insert;

    var dbo = client.db("irc_db");
    dbo.collection("messages").insertOne(new_messages, function(err, res) {
        if (err)
            throw err;
    });
}

function close_client() {
    setTimeout(function() {
        console.log("CLOSE THE DB");
        client.close();
    }, 2000);
}

module.exports = { get_messages_db, insert_messages_db, connect_to_db, close_client };