import React, {useState} from 'react';
import { Link } from 'react-router-dom';

import "./Join.css";


const Join = ({Join}) => {

    const [name, setName] = useState('');
    const [room, setRoom] = useState(''); 

    const joinInput = (event) => {
        event.preventDefault();
        document.getElementById("bouton").click();

    }

    const clickJoinInput = (event) => {
        if (!name)
           event.preventDefault();
        console.log("dans click join input");
        localStorage.setItem('name', name);
        localStorage.setItem('room', 'GENERAL');
    }

    return (
        <div className="joinOuterContainer">
            <div className="joinInnerContainer">
                <h1 className="heading">Join</h1>
                <div>
                    <input 
                    placeholder="Name" 
                    id="joinInput"
                    className="joinInput" 
                    type="text" 
                    onChange={(event) => setName(event.target.value)}
                    onKeyPress={event => event.key === 'Enter' ? joinInput(event) : null}
                    />
                </div>
                {/* <div><input placeholder="Room" className="joinInput mt-20" type="text" onChange={(event) => setRoom(event.target.value)} /></div> */}
                {/* <Link onClick={event => (!name) ? event.preventDefault() : null} to={`/chat?name=${name}&room=${room}`}> */}
                <Link onClick={clickJoinInput} to={`/chat`}>
                    <button 
                    className="button mt-20" 
                    type="submit"
                    id="bouton"
                    >
                        Join
                    </button>
                </Link>
               
            </div>
        </div>
        
    )


}

export default Join;