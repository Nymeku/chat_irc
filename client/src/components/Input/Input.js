import React from 'react';

import './Input.css';

const Input = ({ setMessage, sendMessage, message, is_writing_func }) => (
    <form className="form">
        <input
            list="cmd"
            autoComplete="off"
            className="input"
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={({ target: { value } }) => {setMessage(value); is_writing_func(value)}}
            onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
        />
            <datalist id="cmd">
                <option value="/nick " />
                <option value="/list" />
                <option value="/create " />
                <option value="/delete " />
                <option value="/join " />
                <option value="/quit" />
                <option value="/users" />
                <option value="/msg" />
            </datalist>
        <button className="sendButton" onClick={e => sendMessage(e)}>Send</button>
    </form>
)

export default Input;