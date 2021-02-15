import React, {useState, useEffect} from 'react';
import queryString from 'query-string';
import io from 'socket.io-client';
import "./Chat.css";
import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import Input from '../Input/Input';
import RenderChannels from '../Channels/RenderChannels';
import onlineIcon from '../../icons/onlineIcon.png';
import img_writing from './is_writing.gif'

let socket;

var connectionOptions = {"force new connections" : true, "reconnectAttempts" : "Infinity",  "timeout" : 10000, "transports" : ["websockets"]};

const Chat = ({location}) => {
    const [name, setName] = useState(localStorage.getItem('name'));
    const [room, setRoom] = useState('GENERAL');
    const [users, setUsers] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [channels, setChannels] = useState([]);

    const ENDPOINT = 'localhost:5000';


    useEffect(() => {
        // const {name, room} = queryString.parse(location.search);
        socket = io(ENDPOINT,{ forceNew: true });

        socket.emit('join', { name, room }, (error) => {
            if (error) {
                alert(error);
                window.location.href = '/';
            }
        });
    }, [ENDPOINT, location.search]);

    useEffect(() => {

        socket.on('STOKE_ID', socket_id => {
            localStorage.setItem('current_user_id', socket_id);
        });

        socket.on('RECEIVE_MESSAGE', message => {
            document.getElementById('is_writing').style.display = "none";
            setMessages(messages => [...messages, message]);
        });

        socket.on("roomData", ({ users }) => {
            console.log("USERS DANS ROOM DATA: ");
            console.log(users);
            setUsers(users);
        });

        socket.on("channelsData", ({ channels }) => {
            setChannels(channels);
        });

        socket.on('UPDATE_CHANNELS', function(new_channels) {
            setChannels(new_channels);
        });

        socket.on("NEW_NAME", new_name => {
            console.log("NEW NAMMMME:");
            console.log(new_name);
            setName(new_name);
            localStorage.setItem('name', new_name);
        });

        socket.on("CHANGE_CHANNEL", new_room => {
            setRoom(new_room);
            localStorage.setItem('room', new_room);
        });

        socket.on("DISCONNECTED", () => {
            window.location.href = '/';
            localStorage.removeItem('name');
            localStorage.removeItem('room');
            localStorage.removeItem('current_user_id');
        });

        socket.on('IS_WRITING', someone_writing => {
            if (someone_writing == true)
                document.getElementById('is_writing').style.display = "block";
            else if (someone_writing == false)
                document.getElementById('is_writing').style.display = "none";
        });

    }, []);

    const sendMessage = (event) => {
        event.preventDefault();
        if (message) {
            if (message.includes('/nick')) {
                socket.emit('CHANGE_USERNAME', message.split(' ')[1]);
            } else if (message.includes('/create')) {
                socket.emit('CREATE_CHANNEL', message.split(' ')[1]);
            } else if (message.includes('/join')) {
                socket.emit('JOIN_CHANNEL', message.split(' ')[1]);
            } else if (message.includes('/delete')) {
                socket.emit('DELETE_CHANNEL', message.split(' ')[1]);
            } else if (message.includes('/users')) {
                socket.emit('GET_USERS')
            } else if (message.includes('/list')) {
                socket.emit('GET_LIST_CHANNELS', message.split(' ')[1]);
            } else if (message.includes('/quit')) {
                socket.emit('QUIT_CHANNEL', message.split(' ')[1])
            } else if (message.includes('/msg')) {
                var str_array = message.split(' ');
                str_array.shift();
                str_array.shift();
                socket.emit('SEND_MSG_USER', message.split(' ')[1], str_array.join(' '));
            } else
                socket.emit('sendMessage', message, () => setMessage(''));
        }
        document.getElementById('is_writing').style.display = "none";
        setMessage('');
    }

    const is_writing_func = (event) => {
        if (event.length > 0) {
            socket.emit("SEND_IS_WRITING", true);
            // document.getElementById('is_writing').style.display = "block";
        } else {
            socket.emit("SEND_IS_WRITING", false);
            // document.getElementById('is_writing').style.display = "none";
        }
    }

    return (
        <div className="outerContainer">
            <div className="nameContainer">
                <h1 className="nameTag">{name}</h1>
                <RenderChannels channels={channels}/>
            </div>
            <div className="container">
                <Messages messages={messages} name={name} />
                <p id="is_writing"><img src={img_writing} /></p>
                <Input
                    message={message} setMessage={setMessage}
                    sendMessage={sendMessage} is_writing_func={is_writing_func}
                />

            </div>
            <div className="currentChannel">
                <p id="currentChannelP">{room}</p>
            </div>
            {/* <TextContainer users={users}/> */}
        </div>
    );
}

export default Chat;