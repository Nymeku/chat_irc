const express = require('express');
const http = require('http');

const PORT = process.env.PORT || 5000;
const router = require('./tools/router');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const io = require('socket.io')(server, {
    cors: {
		origin: '*',
    }
});

/******* Functions Require *******/
const { addUser, removeUser, getUser, getUsersInRoom, getAllUsers} = require('./tools/users.js');
const { get_channels_func, get_users_func } = require("./tools/get_data_func.js");
const { get_date } = require("./tools/my_date.js");
const { get_messages_db, insert_messages_db, close_client, connect_to_db } = require("./db_func/mongo_func.js");

app.use(cors());
app.use(router);

channels = [{
	author_id: 'Admin',
	name: 'GENERAL',
	users: []
}]

io.on('connection', (socket) => {
	connect_to_db();
    var socket_username = null;
    socket.on('join', ({name, room}, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
		socket_username = name;
		socket.join(room);

		if (error) return callback(error);

		socket.emit('STOKE_ID', socket.id);

		get_messages_db(socket);

        socket.emit('RECEIVE_MESSAGE', {
			channel: "PRIVATE",
			date: get_date(),
			author_of_msg: 'Admin',
			text: `Hi ${user.name}, Welcome to our chat, you can join/create a channel or you can chat in this GENERAL channel.`
		});

		console.log(name + " has logged in !");
		socket.broadcast.to(user.room).emit('RECEIVE_MESSAGE', {
			channel: user.room,
			date: get_date(),
			author_of_msg: 'Admin',
			text: `${user.name}, has joined the chat!`
		});

		var new_user = {
			id: socket.id,
			name: socket_username,
			room: room
		};
		var current_channel = channels.find(o => o.name === room);
		current_channel.users.push(new_user);
        io.to(user.room).emit('roomData', { room: user.room, users: current_channel.users });

        io.to(user.room).emit('channelsData', { room: user.room, channels: channels});

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        console.log(user.room);
		var my_new_msg = {
			user_id: socket.id,
			channel: user.room,
			date: get_date(),
			author_of_msg: user.name,
			text: message
		}
		insert_messages_db(my_new_msg);
        io.to(user.room).emit('RECEIVE_MESSAGE', my_new_msg);
        callback();
    });

	socket.on('CHANGE_USERNAME', (new_name) => {
		socket_username = new_name;

		channels.forEach(channel => {
			var existName  = channel.users.findIndex(o => o.name === new_name);
			if (existName !== -1 || new_name === "Admin")
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					author_of_msg: 'Admin',
					text: "This name is already taken."
				});
			else {
				var index_user  = channel.users.findIndex(o => o.id === socket.id);
				if (index_user > -1) {
					var name_to_change = channel.users[index_user].name;
					channel.users[index_user].name = new_name;
					getUser(socket.id).name = new_name;
					console.log(name_to_change + " has change his name to: " + new_name);

					io.to(channel.name).emit('RECEIVE_MESSAGE', {
						channel: channel.name,
						date: get_date(),
						author_of_msg: 'Admin',
						text: name_to_change + " has change his name to: " + new_name
					});

					io.to(channel.name).emit('roomData', { room: channel.name, users: channel.users});
					io.to(socket.id).emit('NEW_NAME', new_name);
				}
			}
		});
	});


	socket.on('GET_USERS', function() {
		get_users_func(socket, io, channels);
	});

	socket.on('GET_LIST_CHANNELS', function(contains_str) {
		get_channels_func(socket, io, contains_str, channels);
	});

    socket.on('CREATE_CHANNEL', function(channel) {
		var current_channel = channels.find(o => o.name === channel);
		if (current_channel == undefined) {
			io.emit('RECEIVE_MESSAGE', {
				channel: "GENERAL",
				date: get_date(),
				// image: icon,
				author_of_msg: "Admin",
				text: "A new channel was created : " + channel + ". Enter /join " + channel + " to join it."
            });

			var chat = {
				author_id: socket.id,
				name: channel,
				users: []
			}
			channels.push(chat);
			io.emit('UPDATE_CHANNELS', channels);
			console.log("A new channel was created: " + channel);
		} else {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: get_date(),
				// image: icon,
				author_of_msg: "Admin",
				text: "This channel already exists. Enter /join " + channel + " to joint the discussion."
			});
		}

    });

	socket.on('JOIN_CHANNEL', function(room) {
		if (socket_username) {
			var current_channel = channels.find(o => o.name === room);
			if (current_channel == undefined) {
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: "Admin",
					text: "This channel: '" + room + "' doesn't exist"
				});
			} else {
				index_user = current_channel.users.findIndex(o => o.id === socket.id);
				if (index_user > -1) {
					io.to(socket.id).emit('RECEIVE_MESSAGE', {
						channel: "PRIVATE",
						date: get_date(),
						// image: icon,
						author_of_msg: "Admin",
						text: "You are already in this channel. Type / create to create a new channel."
					});
				} else {
					socket.join(room);
					io.to(getUser(socket.id).room).emit('IS_WRITING', false);
					getUser(socket.id).room = room;
					console.log("THE NEW ROOM OF THE CURRENT USER === " + getUser(socket.id).room);
					io.to(socket.id).emit('CHANGE_CHANNEL', room);
					var user = {
						id: socket.id,
						name: socket_username,
						room: room
					};
					current_channel.users.push(user);
					console.log("LES USER DANS CE CHANNEL: ");
					console.log(current_channel.users);

					io.to(room).emit('roomData', { room: room, users:  current_channel.users});
					console.log('[' + socket.id + ']', 'joined the channel :', room)
					io.to(room).emit('RECEIVE_MESSAGE', {
						channel: room,
						date: get_date(),
						// image: icon,
						author_of_msg: 'Admin',
						text: socket_username + " just joined the channel: " + room
					});
				}
			}
        }
	});

	socket.on('DELETE_CHANNEL', function(room) {
		var channel_del = channels.find(o => o.name === room);
		if (channel_del == undefined) {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: get_date(),
				// image: icon,
				author_of_msg: "Admin",
				text: "This channel: '" + room + "' doesn't exist"
			});
		} else {
			if (channel_del.author_id !== socket.id) {
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: "Admin",
					text: "You can't delete this channel: " + room
				});
			} else {
				console.log("USER IN CHANNEL DEL:");
				console.log(channel_del.users);
				channel_del.users.forEach(user_in_del => {
					console.log("EACH USER: ");
					console.log(user_in_del);
					if (user_in_del.id !== socket.id) {
						io.to(user_in_del.id).emit('CHANGE_CHANNEL', "GENERAL");
						io.to(user_in_del.id).emit('RECEIVE_MESSAGE', {
							channel: "PRIVATE",
							date: get_date(),
							// image: icon,
							author_of_msg: 'Admin',
							text: "The channel: " + room + " was deleted"
						});
					}
				});
				if (getUser(socket.id).room === room) {
					io.to(socket.id).emit('CHANGE_CHANNEL', "GENERAL");
					getUser(socket.id).room = "GENERAL";
				}
				channels.splice(channels.findIndex(o => o.name === room), 1);
				io.emit('UPDATE_CHANNELS', channels);
				io.to("GENERAL").emit('roomData', { room: "GENERAL", users: channels.find(o => o.name === "GENERAL").users});
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: 'Admin',
					text: "You deleted the channel: " + room
				});
				io.to('GENERAL').emit('RECEIVE_MESSAGE', {
					channel: "GENERAL",
					date: get_date(),
					// image: icon,
					author_of_msg: 'Admin',
					text: "The channel: " + room + " was deleted."
				});
				console.log("A channel was deleted: " + room);
			}
		}
	});

	socket.on('QUIT_CHANNEL', function(room) {
		if (socket_username) {
			if (room === "GENERAL") {
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: "Admin",
					text: "You can't quit the Principal Channel!!!"
				});
				return;
			}
			var channel = channels.find(o => o.name === room);
			if (channel == undefined) {
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: "Admin",
					text: "This channel: " + room + " doesn't exist"
				});
			} else {
				index_user = channel.users.findIndex(o => o.id === socket.id);
				if (index_user === -1) {
					io.to(socket.id).emit('RECEIVE_MESSAGE', {
						channel: "PRIVATE",
						date: get_date(),
						// image: icon,
						author_of_msg: "Admin",
						text: "You are not in this channel: " + room
					});
				} else {
					socket.leave(room);
					getUser(socket.id).room = "GENERAL";
					io.to(socket.id).emit('CHANGE_CHANNEL', "GENERAL");
					channel.users.splice(index_user, 1);
					io.to(room).emit('roomData', { room: room, users:  channel.users});
					console.log('[' + socket.id + ']', 'quit the channel :', room);
					io.to(room).emit('RECEIVE_MESSAGE', {
						channel: room,
						date: get_date(),
						// image: icon,
						author_of_msg: 'Admin',
						text: socket_username + " left the channel: " + room
					});

					io.to(socket.id).emit('RECEIVE_MESSAGE', {
						channel: "PRIVATE",
						date: get_date(),
						// image: icon,
						author_of_msg: 'Admin',
						text: "You left the channel: " + room
					});
				}
			}
        }
	});


	socket.on('SEND_MSG_USER', function(nickname_send, msg_send) {
		var all_users = getAllUsers();
		var current_user_index = all_users.findIndex(o => o.id === socket.id);
		if (all_users[current_user_index].name === nickname_send) {
			io.to(socket.id).emit('RECEIVE_MESSAGE', {
				channel: "PRIVATE",
				date: get_date(),
				// image: icon,
				author_of_msg: 'Admin',
				text: "You can't send a message to yourself"
			});
		} else {
			var user_to_send_index = all_users.findIndex(o => o.name === nickname_send);
			if (user_to_send_index > -1) {
				console.log("MESAGE SEND: ");
				console.log(msg_send);
				io.to(all_users[user_to_send_index].id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: socket_username,
					text: msg_send
				});
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					user_id: socket.id,
					channel: "#PRIVATE:" + nickname_send,
					date: get_date(),
					// image: icon,
					author_of_msg: socket_username,
					text: msg_send
				});
			} else {
				io.to(socket.id).emit('RECEIVE_MESSAGE', {
					channel: "PRIVATE",
					date: get_date(),
					// image: icon,
					author_of_msg: 'Admin',
					text: "User: " + nickname_send + " doesn't exist"
				});
			}
		}
	});


    socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		channels.forEach(channel => {
			var index_user  = channel.users.findIndex(o => o.id === socket.id);
			if (index_user > -1) {
				var name_disconnect = channel.users[index_user].name;
				console.log(name_disconnect + " has disconnected!");
				io.to(socket.id).emit('DISCONNECTED');
				channel.users.splice(index_user, 1);
				// socket.leave(channel.name);
				io.to(channel.name).emit('RECEIVE_MESSAGE', {
					channel: channel.name,
					date: get_date(),
					author_of_msg: 'Admin',
					text: name_disconnect + ' has disconnected!'
				});
				io.to(channel.name).emit('roomData', { room: channel.name, users: channel.users});
				close_client();
			}
		});
    });

	socket.on('SEND_IS_WRITING', function(is_writing) {
		const user = getUser(socket.id);
		var current_channel = channels.find(o => o.name === user.room);
		current_channel.users.forEach(user_tmp => {
			if (user_tmp.id !== user.id)
				io.to(user_tmp.id).emit('IS_WRITING', is_writing);
		});
	});
});

app.use(router);

server.listen(process.env.PORT || 5000, () => console.log(`Server is running on port 5000`));