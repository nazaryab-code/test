import React, { memo, useMemo, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { useTranslation } from 'react-i18next';
import img from '../styles/user1.png';
import messageSound from '../styles/sound/send.mp3';
import clickSound from '../styles/sound/clicktoggle.mp3';
import doc from '../styles/doc.png';


const messageSoundRef = new Audio(messageSound);
const clickSoundRef = new Audio(clickSound);

function Primary({ data: { user, text, time, message_id, documentName, contentType, content }, onDelete }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isForwardMenuOpen, setIsForwardMenuOpen] = useState(false);

  const [forwardUsers, setForwardUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/messages/${message_id}`);
      onDelete && onDelete(message_id);
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleForward = () => {
    setIsMenuOpen(false);
    clickSoundRef.play();
    setIsForwardMenuOpen(true);

  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
  
    return `${day}/${month}/${year}`;
  };
  
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
  
    return `${hours}:${minutes}`;
  };

  const handleSelectUserForForward = async (selectedUser) => {
    setIsForwardMenuOpen(false);
  
    try {
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTime();
  
      const response = await axios.post(`${API_BASE_URL}/api/sendMessage`, {
        sender: user, 
        receiver: selectedUser.full_name,
        date: currentDate,
        time: currentTime,
        chat: text,
      });
      messageSoundRef.play();
      console.log('API Response:', response.data);
      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsForwardMenuOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const fetchForwardUsers = async () => {
      try {
        const response = await axios.get(API_BASE_URL + '/api/users');
        const usersWithStatus3 = response.data.filter(user => user.status === 3);
        setForwardUsers(usersWithStatus3);
      } catch (error) {
        console.error('Error fetching forward users:', error);
      }
    };

    if (isForwardMenuOpen) {
      fetchForwardUsers();
    }
  }, [isForwardMenuOpen, user]);

  const filteredUsers = forwardUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const closeForwardMenu = () => {
    setIsForwardMenuOpen(false);
  };

  const handleDownloadDocument = async () => {
    try {
      // Check if content is present
      if (!content) {
        console.error('Document content is empty.');
        return;
      }

      // Decode base64 content
      const decodedContent = atob(content);

      // Create a Blob from the decoded content
      const blob = new Blob([decodedContent], { type: contentType });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);

      // Trigger the click event to start the download
      a.click();

      // Remove the download link
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };
  // console.log('Content:', content);
  // console.log('Document Name:', documentName);
  // console.log('Content Type:', contentType);
  
  return (
    <div className="column is-12 is-paddingless primary">
      <div>
        <strong className="is-block">{user}</strong>
      </div>
      <div className="text">
        <div className="message-options">
          <span className="options-icon" onClick={toggleMenu}>
            <i className="fas fa-ellipsis-v"></i>
          </span>
          {isMenuOpen && (
            <div className="options-menu">
              <div className="option" onClick={handleDelete}>
                <i className="fas fa-trash"></i> {t('Delete')}
              </div>
              <div className="option" onClick={handleForward}>
                <i className="fa fa-retweet"></i> {t('Forward')}
              </div>
            </div>
          )}
        </div>
        {isForwardMenuOpen && (
          <div className="forward-menu">
            <div className="forward-menu-header">
              <span title={t('close')} onClick={closeForwardMenu}>
                <i className="fa fa-window-close"></i>
              </span>
            </div>
            {/* Add the search bar */}
            <input
              type="text"
              className='searchHeader'
              placeholder={t('searchFullname')}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {filteredUsers.map((user) => (
              <div className="user1" key={user.username} onClick={() => handleSelectUserForForward(user)}>
                <div className="user-image">
                  <img src={img} alt="User" />
                </div>
                <div className="user-name">{user.full_name}</div>
              </div>
            ))}
          </div>
        )}
        {!text ? (
          <div onClick={handleDownloadDocument} title={t('Download')} className='docMain' style={{ cursor: 'pointer' }}>
              <img className='doc' src={doc} alt='Document'></img>
              <span>{documentName}</span>
          </div>
        ) : (
          <>{text}</>
        )}
        <div className="message-info">
          <div className="info-left">
            <time>{time}</time>
          </div>
          <div className="info-right" title={t('read')}>
            <i className='tick fas fa-check-double'></i>
          </div>
        </div>
      </div>
    </div>
  );
}
// Inside the Secondary component
function Secondary({ data: { user, text, time, documentName, contentType, content, status }, onReply, currentUser }) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isForwardMenuOpen, setIsForwardMenuOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [forwardUsers, setForwardUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleReply = () => {
    onReply && onReply(text, user);
    setIsMenuOpen(false);
    setSelectedMessage({ user, text, time }); 
  };

  const handleForward = () => {
    setIsMenuOpen(false);
    clickSoundRef.play();
    setIsForwardMenuOpen(true);
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');
  
    return `${day}/${month}/${year}`;
  };
  
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
  
    return `${hours}:${minutes}`;
  };
  

  const handleSelectUserForForward = async (selectedUser) => {
    console.log('userSession before API call:', currentUser);
    setIsForwardMenuOpen(false);
  
    try {
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTime();

      const response = await axios.post(`${API_BASE_URL}/api/sendMessage`, {
        sender: currentUser,
        receiver: selectedUser.full_name,
        date: currentDate,
        time: currentTime,
        chat: text,
      });
      messageSoundRef.play();
      console.log('API Response:', response.data);
      console.log('Message sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsForwardMenuOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    const fetchForwardUsers = async () => {
      try {
        const response = await axios.get(API_BASE_URL + '/api/users');
        const usersWithStatus3 = response.data.filter(user => user.status === 3);
        setForwardUsers(usersWithStatus3);
      } catch (error) {
        console.error('Error fetching forward users:', error);
      }
    };

    if (isForwardMenuOpen) {
      fetchForwardUsers();
    }
  }, [isForwardMenuOpen, currentUser]);

  // Filter users based on the search query
  const filteredUsers = forwardUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const closeForwardMenu = () => {
    setIsForwardMenuOpen(false);
  };
  const handleDownloadDocument = async () => {
    try {
      // Check if content is present
      if (!content) {
        console.error('Document content is empty.');
        return;
      }

      // Decode base64 content
      const decodedContent = atob(content);

      // Create a Blob from the decoded content
      const blob = new Blob([decodedContent], { type: contentType });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documentName;
      document.body.appendChild(a);

      // Trigger the click event to start the download
      a.click();

      // Remove the download link
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <div className="column is-12 has-text-right is-paddingless is-clearfix secondary">
      <div className="message-options1">
        <span className="options-icon1" onClick={toggleMenu}>
          <i className="fas fa-ellipsis-v"></i>
        </span>
        {isMenuOpen && (
          <div className="options-menu1">
            <div className="option1" onClick={handleReply}>
              <i className="fa fa-retweet"></i> {t('Reply')}
            </div>
            <div className="option1" onClick={handleForward}>
              <i className="fa fa-reply-all"></i> {t('Forward')}
            </div>
          </div>
        )}

        {isForwardMenuOpen && (
          <div className="forward-menu">
            <div className="forward-menu-header">
              <span title={t('close')} onClick={closeForwardMenu}>
                <i className="fa fa-window-close"></i>
              </span>
            </div>
            {/* Add the search bar */}
            <input
            className='searchHeader'
              type="text"
              placeholder={t('searchFullname')}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {filteredUsers.map((user) => (
              <div className="user1" key={user.username} onClick={() => handleSelectUserForForward(user)}>
                <div className="user-image">
                  <img src={img} alt="User" />
                </div>
                <div className="user-name">{user.full_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <strong className="is-block">{user}</strong>
      <div className="text is-pulled-right">
        {!text ? (
          <div onClick={handleDownloadDocument} title={t('Download')} className='docMain1' style={{ cursor: 'pointer' }}>
            <img className='doc1' src={doc} alt='Document'></img>
            <span>{documentName}</span>
          </div>
        ) : (
          <>{text}</>
        )}
        <time className="is-block has-text-right">{time}</time>
      </div>
      {/* Render the selected message */}
      {selectedMessage && (
        <div className="reply">
        <div className="reply-text">
          {selectedMessage.text}
        </div>
        <div className="close-icon" onClick={() => setSelectedMessage(null)}>
          <i className="fa fa-times-circle"></i>
        </div>
      </div>
      )}
    </div>
  );
}
// end of Secondary component

function Message() {
  const [messages, setMessages] = useState([]);
  const userSessionString = sessionStorage.getItem('userSession');
  const userSession = userSessionString ? JSON.parse(userSessionString).full_name : null;
  const selectedUser = sessionStorage.getItem('selectedUserName');
  console.log('Message Selected ', selectedUser);

  const handleDeleteMessage = useCallback(async (deletedMessageId) => {
    try {      
      // Delete the message locally
      const updatedMessages = messages.filter((message) => message._id['$oid'] !== deletedMessageId['$oid']);
      setMessages(updatedMessages);
      localStorage.setItem('messages', JSON.stringify(updatedMessages));

      // Fetch new messages after deleting
      const response = await axios.post(API_BASE_URL + '/api/getMessages', {
        userId: userSession,
        otherUserId: selectedUser || 'Customer Support',
      });
  
      const newMessages = response.data.messages;
  
      setMessages(newMessages);
      localStorage.setItem('messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error deleting or fetching messages:', error);
    }
  }, [messages, userSession, selectedUser]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Clear previous messages
        setMessages([]);

        // Fetch new messages
        const response = await axios.post(API_BASE_URL + '/api/getMessages', {
          userId: userSession,
          otherUserId: selectedUser || 'Customer Support',
        });

        const newMessages = response.data.messages;
        // Update local state
        setMessages(newMessages);

        // Save to localStorage
        localStorage.setItem('messages', JSON.stringify(newMessages));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchData();
  }, [userSession, selectedUser]);

  // Memoize displayed messages to prevent unnecessary re-renders
  const displayedMessages = useMemo(() => {
    // Sort messages by date and time
    const sortedMessages = messages
      .slice()
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      })
      .sort((a, b) => {
        // Secondary sorting by message_id (or any other unique identifier)
        return a.message_id - b.message_id;
      });
  
    return sortedMessages.map((message) => {
      const messageProps = {
        id: message._id,
        user: message.sender,
        text: message.chat,
        time: `${message.date} ${message.time}`,
        message_id: message.message_id,
        documentName: message.documentName,
        contentType: message.contentType,
        content: message.content,
      };
  
      return message.sender === userSession ? (
        <Primary key={message._id} data={messageProps} currentUser={userSession} onDelete={handleDeleteMessage} />
      ) : (
        <Secondary key={message._id} data={messageProps} currentUser={userSession} />
      );
    });
  }, [messages, userSession, handleDeleteMessage]);  

  // Render the displayed messages
  return <>{displayedMessages}</>;
}

export default memo(Message);
