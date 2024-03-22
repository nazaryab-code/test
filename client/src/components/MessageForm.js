import React, { useState, useEffect, useRef } from 'react';
//import { useMessagesDispatch } from '../contexts/MessagesContext';
import socket from '../Socket';
import NoteModal from './NoteModal';
import messageSound from '../styles/sound/send.mp3';
import clickSound from '../styles/sound/clicktoggle.mp3';
import openSetting from '../styles/sound/coin.mp3';
import { useUserSession } from '../components/UserSessionContext';
import API_BASE_URL from './apiConfig'; 
import { useTranslation } from 'react-i18next';

function MessageForm({ selectedUser, replyText, onSend }) {
  const { t } = useTranslation();
  const textareaRef = useRef(null);
  const fullName = localStorage.getItem('fullName');
  //const dispatch = useMessagesDispatch();
  const [showOptions, setShowOptions] = useState(false);
  const [isRobotOn, setIsRobotOn] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const fileInputRef = useRef(null);
  const audioRef = useRef(new Audio(messageSound));
  const audio1Ref = useRef(new Audio(clickSound));
  const audio3Ref = useRef(new Audio(openSetting));
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
  const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

  const { userSession } = useUserSession();
  console.log('Message 1 Current:', userSession.full_name);
  console.log('Message 2 Selected:', selectedUser);

  useEffect(() => {
    // Update textarea value when replyText changes
    if (replyText !== null && textareaRef.current) {
      textareaRef.current.value = replyText;
    }
  }, [replyText]);

  const checkSubmit = (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.keyCode === 13 || e.keyCode === 10)) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    let textarea = textareaRef.current;
  
    if (!textarea.value.trim()) {
      return;
    }
  
    const receiver = selectedUser ? selectedUser : 'Customer Support';
    const sender = userSession.full_name;
  
    // Helper function to send message data
    const sendMessage = async (data) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/sendMessage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const responseData = await response.json();
        console.log('API Message Response:', responseData);
  
        socket.emit('send message', {
          user: data.sender,
          text: data.chat,
        });

  
        audioRef.current.play();
  
        textarea.value = '';
        onSend();
      } catch (error) {
        console.error('Error sending message to API:', error);
      }
    };
   

    try {
    //   // Make a request to get user info by name
    //   const userInfoResponse = await fetch(`${API_BASE_URL}/api/getUserInfoByName`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ full_name: sender }),
    //   });
  
      const userInfo = userSession.status;
  
      // Check if sender has status 3
      if (userInfo && userInfo.status === 3) {
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
        const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;
  
        const messageData = {
          sender: sender,
          receiver: receiver,
          chat: textarea.value,
          date: formattedDate,
          time: formattedTime,
          status: '1',
        };

        // Send message data with sender as the logged-in user
        sendMessage(messageData);
        if (userInfo && userInfo.full_name === 'Customer Support'){

        }
        else{
          // Send message data with sender as 'Customer Support'
          messageData.sender = 'Customer Support';
          sendMessage(messageData);
        }
      } else {
        // If sender does not have status 3, send message with original sender
        
        
        const messageData = {
          sender: sender,
          receiver: receiver,
          chat: textarea.value,
          date: formattedDate,
          time: formattedTime,
          status: '1',
        };
  
        // Send message data with original sender
        sendMessage(messageData);
        messageData.receiver = 'Ram Singh';
        sendMessage(messageData);
      }
    } catch (error) {
      console.error('Error getting user info:', error);
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
        const reader = new FileReader();

        reader.onload = () => {
            const fileContent = reader.result;

            const formData = new FormData();
            formData.append('sender', fullName);
            formData.append('receiver', selectedUser || 'Customer Support');
            formData.append('date', formattedDate);
            formData.append('time', formattedTime);
            formData.append('documentName', selectedFile.name);
            formData.append('contentType', 'document');
            
            // Append the ArrayBuffer directly to FormData
            formData.append('file', new Blob([fileContent]));

            // Send the file using FormData
            fetch(`${API_BASE_URL}/api/sendDocument`, {
                method: 'POST',
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };

        reader.readAsArrayBuffer(selectedFile);
    }
};

  const toggleRobot = () => {
    setIsRobotOn(!isRobotOn);
    audio1Ref.current.play();
  };

  const handleOptionClick = (option) => {
    audio1Ref.current.play();
    setShowOptions(false);

    if (option === 'Note') {
      setShowNoteModal(true);
      setNoteContent('');
    } else if (option === 'Share') {
      fileInputRef.current.click();
    } 
    else if (option === 'Location') {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

          const currentValue = textareaRef.current.value;

          textareaRef.current.value = currentValue ? `${currentValue}\n${locationLink}` : locationLink;

          textareaRef.current.focus();
        },
        (error) => {
          console.error('Error getting location:', error.message);
        }
      );
    } else {
      // Handle other options
      // ...
    }
  };
  const closeNoteModal = () => {
    setShowNoteModal(false);
  };

  

  return (
    <>
      <div className="column is-paddingless">
        <textarea
          ref={textareaRef}
          autoFocus={true}
          className="textarea is-shadowless scrollable-content"
          rows="2"
          placeholder={t('TypeMessage')}
          onKeyDown={checkSubmit} required
        ></textarea>

      <div className="containerswitch">
                  <label className="switch"><input type="checkbox" onChange={toggleRobot}/>    <div>
                  <label className="robot">{isRobotOn ? t('Roff') : t('Ron')}</label>
                  </div>
                  </label>
                  
                </div>

            </div>

      <div className="column is-2-mobile is-1-tablet is-paddingless">
        <div className="dropdown-wrapper">

          
        <div className="button-tooltip">
          <button 
            className="button is-medium is-paddingless is-white"
            onClick={() => setShowOptions(!showOptions)}
          >
            <i className="far fa-plus" onClick={() => audio3Ref.current.play()}></i>
            <div className="tooltip">{t('MoreSettings')}</div>
          </button>
        </div>


          {/* Dropdown Popup for Options */}
          {showOptions && (
            <div className="dropdown-options">
              <div className="options-group">
                <button className="dropdown-option" onClick={() => handleOptionClick('Idea')}>
                <i className="fa fa-lightbulb" aria-hidden="true"></i>  {t('Idea')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Price')}>
                <i className="fa fa-inr" aria-hidden="true"></i>  {t('Pricerequest')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Transfer')}>
                <i className="fa fa-comments" aria-hidden="true"></i>  {t('Transfer')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Invite')}>
                <i className="fa fa-user-plus" aria-hidden="true"></i>  {t('Invite')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Email')}>
                <i className="fa fa-envelope" aria-hidden="true"></i>  {t('Email')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Knowledge')}>
                <i className="fa fa-book" aria-hidden="true"></i> {t('Knowledge')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Estimate')}>
                <i className="fa fa-archive" aria-hidden="true"></i> {t('Estimate')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Block')}>
                <i className="fa fa-lock" aria-hidden="true"></i> {t('Block')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('ScreenShare')}>
                <i className="fa fa-desktop" aria-hidden="true"></i> {t('ScreenShare')}
                </button>
              </div>
              <div className="options-group">
                <button className="dropdown-option" onClick={() => handleOptionClick('Lead')}>
                <i className="fa fa-flag" aria-hidden="true"></i>  {t('Lead')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Deal')}>
                <i className="fa fa-handshake" aria-hidden="true"></i> {t('Deal')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Task')}>
                <i className="fa fa-thumb-tack" aria-hidden="true"></i> {t('Task')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Sales')}>
                <i className="fa fa-balance-scale" aria-hidden="true"></i> {t('Sales')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Call')}>
                <i className="fa fa-phone" aria-hidden="true"></i> {t('Call')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Location')}>
                <i className="fa fa-map-marker" aria-hidden="true"></i> {t('Location')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('URL')}>
                 <i className="fa fa-globe" aria-hidden="true"></i> {t('URL')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Note')}>
                <i className="fa fa-exclamation-circle" aria-hidden="true"></i> {t('Note')}
                </button>
                <button className="dropdown-option" onClick={() => handleOptionClick('Share')}>
                <i className="fa fa-share" aria-hidden="true"></i> {t('Share')}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="button-tooltip">
          <button 
            className="button is-medium is-paddingless is-white"
            onClick={handleSubmit}
          >
            <i className="far fa-paper-plane"></i>
            <div className="tooltip">{t('sendMessage')}</div>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />


      </div>
      {/* Render the NoteModal when showNoteModal is true */}
      {showNoteModal && (
        <NoteModal onClose={closeNoteModal} noteContent={noteContent} />
      )}
    </>
  );
}

export default MessageForm;