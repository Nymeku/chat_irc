import React from 'react';

// import onlineIcon from '../../icons/onlineIcon.png';

import './RenderChannels.css';

const RenderChannels = ({ channels }) => (
<div className="RenderChannels">
{
    channels
    ? (
        <div>
        <h1>Channels :</h1>
        <div className="activeContainer">
            <h2>
            {channels.map(({name}) => (
                <div key={name} className="activeItem">
                {name}
                {/* <img alt="Online Icon" src={onlineIcon}/> */}
                </div>
            ))}
            </h2>
        </div>
        </div>
    )
    : null
}
</div>
);

export default RenderChannels;