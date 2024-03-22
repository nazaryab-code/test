import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import down from '../styles/down.png';
import { useTranslation } from 'react-i18next';
import socket from '../Socket'; // Import the Socket.IO instance

function MessageList({ messages, userSession, selectedUser, onReply }) {
  const messageListRef = useRef(null);
  const [shouldScrollDown, setShouldScrollDown] = useState(false);
  const [rerenderCounter, setRerenderCounter] = useState(0); // State to trigger rerender
  const { t } = useTranslation();

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRerenderCounter(prevCounter => prevCounter + 1);
  //   }, 3000); 

  //   return () => clearInterval(interval); // Cleanup interval on unmount
  // }, []);

  useEffect(() => {
    if (shouldScrollDown) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      setShouldScrollDown(false);
    }
  }, [shouldScrollDown]);

  const handleScrollDown = () => {
    setShouldScrollDown(true);
  };

  // Listen for the 'send message' event from the server using Socket.IO
  useEffect(() => {
    const handleReceiveMessage = (data) => {
      console.log('Received message from socket:', data);
      // Here you can handle the received data as needed
    };

    socket.on('send message', handleReceiveMessage);

    // Cleanup the event listener
    return () => {
      socket.off('send message', handleReceiveMessage);
    };
  }, []);

  // Render the Message component only if userSession is not null
  return (
    <div className="message-list-container">
      <div ref={messageListRef} className="fade-in columns is-multiline has-text-black has-background-white-bis messagelist scrollable-content" style={{ alignContent: 'flex-start', overflowY: 'auto', maxHeight: '400px' }}>
        {userSession.full_name !== null && (
          <Message key={rerenderCounter} onReply={onReply} data={messages} userSession={userSession.full_name} selectedUser={selectedUser} />
        )}
      </div>
      <div title={t('scroll')} className="scroll-down-button" onClick={handleScrollDown}>
        <img alt='Scroll Down' className='down' src={down}></img>
      </div>
    </div>
  );
}

export default MessageList;
