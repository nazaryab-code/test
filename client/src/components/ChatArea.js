// ChatArea.js
import React, { useEffect, useState } from 'react';
import { useMessages, useMessagesDispatch } from '../contexts/MessagesContext';
import socket from '../Socket';
import LoginForm from './LoginForm';
import MessageForm from './MessageForm';
import MessageList from './MessageList';
import { useUserSession } from '../components/UserSessionContext';
import notificationSound from '../styles/sound/messenger.mp3';

// Notification component
function Notification({ id, user, text, time, onClose }) {
  const handleNotificationClose = React.useCallback(() => {
    onClose(id);
  }, [id, onClose]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleNotificationClose();
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [handleNotificationClose]);

  return (
        <div className="notification">
          <div>
            <strong>{user}</strong>
          </div>
          <div>{text}</div>
          <div>{time}</div>
          <button className="close-button" onClick={handleNotificationClose}>
            <i class='fas fa-times-circle'></i>
          </button>
        </div>
  );
}


function ChatArea({ userSession, selectedUser }) {
  const audio = new Audio(notificationSound);
  const [isLogin, setIsLogin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userName, setUserName] = useState('');
  const messages = useMessages();
  const dispatch = useMessagesDispatch();
  const { setUserSession } = useUserSession();
  const updatedSelectedUser = selectedUser || ('Customer Support' & 'Ram Singh');
  const [replyText, setReplyText] = useState(null);

  
  useEffect(() => {
  

    function onNewUser(newUser) {
      dispatch({
        type: 'newmessage',
        message: {
          type: 'information',
          user: newUser,
          text: 'logged in.'
        }
      });

      setUserSession(newUser);
    }

    function onExitUser(exitUser) {
      dispatch({
        type: 'newmessage',
        message: {
          type: 'information',
          user: exitUser,
          text: 'left.'
        }
      });
    }

    function onNewMessage(message) {
      const isDuplicate = messages.some(
        (existingMessage) =>
          existingMessage.user === message.user &&
          existingMessage.text === message.text
      );
    
      if (!isDuplicate) {
        dispatch({
          type: 'newmessage',
          message: {
            type: 'secondary',
            user: message.user,
            text: message.text,
            date: message.date, 
            time: message.time,
          },
        });
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          {
            id: Date.now(), 
            user: message.user,
            text: message.text,
            time: message.time,
          },
        ]);

        // Play notification sound
        audio.play();
        console.log('UPDATE>>>>', messages);
      }
    }
    

    socket.on('new user', onNewUser);
    socket.on('exit user', onExitUser);
    socket.on('new message', onNewMessage);

    return () => {
      socket.off('new user', onNewUser);
      socket.off('exit user', onExitUser);
      socket.off('new message', onNewMessage);
    };
  }, [dispatch, setUserSession, userSession, selectedUser, messages, audio]); 
  const handleReply = (text) => {
    setReplyText(text);
  };

  const closeNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };
  return (
    <section className="column">
       <div className='main-notification'>
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} onClose={closeNotification} />
      ))}
      </div>
      <MessageList onReply={handleReply} messages={messages} userSession={userName} selectedUser={updatedSelectedUser} />
      <div className=" loginform columns is-mobile has-background-white is-paddingless has-text-centered messageform" >
        {!isLogin && <LoginForm setLogin={setIsLogin} setUserName={setUserName} setUserSession={setUserSession}/>}
        {isLogin && <MessageForm replyText={replyText} onSend={() => setReplyText(null)} fullName={userName} userSession={userSession} selectedUser={updatedSelectedUser} />}
      </div>
    </section>
  );
}

export default ChatArea;