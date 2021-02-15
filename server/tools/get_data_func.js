const { addUser, removeUser, getUser, getUsersInRoom, getAllUsers} = require('./users.js');
const { get_date } = require("./my_date.js");

function get_channels_func(socket, io, contains_str, channels) {
    var list_channels = "";
    var cpt = 0;
    var size = 0;
    channels.forEach(channel => {
        if (contains_str !== null)
            if (channel.name.includes(contains_str))
                size++;
    });
    channels.forEach(channel => {
        if (contains_str !== null) {
            if (channel.name.includes(contains_str)) {
                if (cpt < size - 1)
                    list_channels += " " + channel.name + ",";
                else
                    list_channels += " " + channel.name + ".";
                cpt++;
            }
        } else {
            if (cpt < Object.keys(channels).length - 1)
                list_channels += " " + channel.name + ",";
            else
                list_channels += " " + channel.name + ".";
            cpt++;
        }
    });
    var text = "";
    if (contains_str !== null) {
        if (list_channels === "")
            text = "There is no available channel that contains ’" + contains_str + "’.";
        else
            text = "The available channels contains ’" + contains_str +  "’:" + list_channels;
    } else
        text = "The available channels: " + list_channels;
    io.to(socket.id).emit('RECEIVE_MESSAGE', {
        channel: "PRIVATE",
        date: get_date(),
        author_of_msg: 'Admin',
        text: text
    });
}

function get_users_func(socket, io, channels) {
	var cpt = 0;
    channels.forEach(channel => {
        var index_user = channel.users.findIndex(o => o.id === socket.id);
        if (index_user > -1) {
            var users_by_name = "";
            channel.users.forEach(user_tmp => {
                if (cpt < Object.keys(channel.users).length - 1)
                    users_by_name += " " + user_tmp.name + ",";
                else
                    users_by_name += " " + user_tmp.name + ".";
                cpt++;
            });
            io.to(socket.id).emit('RECEIVE_MESSAGE', {
                channel: "PRIVATE",
                date: get_date(),
                author_of_msg: 'Admin',
                text: "The users in the channel: #" + channel.name + ": " + users_by_name
            });
        }
    });
}

module.exports = { get_channels_func, get_users_func };