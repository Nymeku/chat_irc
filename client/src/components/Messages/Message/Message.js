import React from 'react';

import './Message.css';

import ReactEmoji from 'react-emoji';

const Message = ({ message: { user_id, channel, date, author_of_msg, text }, name }) => {
  let isSentByCurrentUser = false;
  let isAdmin = false;

  const trimmedName = localStorage.getItem('name');

  if (user_id === localStorage.getItem('current_user_id')) {
    isSentByCurrentUser = true;
  }

  if (author_of_msg === "Admin")
    isAdmin = true;

  return (
      <div> {
          isAdmin ?
          (
                    <div className="messageContainer justifyStart">
                        <p className="sentText pl-10 ">{channel} {date} {author_of_msg}</p>
                        {/* <p className="sentText pl-10 ">{date}</p> */}
                        <div id="Admin_Box" className="messageBox backgroundLight">
                            <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
                        </div>
                        {/* <p className="sentText pl-10 author">{author_of_msg}</p> */}
                    </div>
        )
        :   isSentByCurrentUser ?
                (
                    <div className="messageContainer justifyEnd">
                    {/* <p className="sentText pr-10">You</p> */}
                    <div className="messageBox backgroundBlue">
                        <p className="messageText colorWhite">{ReactEmoji.emojify(text)}</p>
                    </div>
                    <p className="sentText pl-10 ">{channel} {date} {author_of_msg}</p>
                    {/* <p className="sentText pl-10 ">{date}</p> */}
                    </div>
                )
                : (
                    <div className="messageContainer justifyStart">
                        <p className="sentText pl-10 ">{channel} {date} {author_of_msg}</p>
                        {/* <p className="sentText pl-10 ">{date}</p> */}
                        <div className="messageBox backgroundLight">
                            <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
                        </div>
                        {/* <p className="sentText pl-10 author">{author_of_msg}</p> */}
                    </div>
                )
        }
    </div>
  );
}

export default Message;