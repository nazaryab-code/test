import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import clickSound from '../styles/sound/tip.mp3';
import { useUserSession } from './UserSessionContext';
import API_BASE_URL from './apiConfig'; 
import axios from 'axios';

function ChatHeader({ onLanguageChange }) {
  const { userSession } = useUserSession();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [notification, setNotification] = useState(null); 
  const fullName = localStorage.getItem('fullName');

  console.log("FullName: ", fullName, 'Usersatation ', userSession );
  
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (notification) {
      console.log('Notification', notification);
      setShowModal(true);
    }
  }, [language, notification]); 

  const changeLanguage = () => {
    setLanguage((prevLanguage) => {
      const newLanguage = prevLanguage === 'en' ? 'ar' : 'en';
      i18n.changeLanguage(newLanguage);
      playClickSound();
      onLanguageChange(newLanguage);
      return newLanguage;
    });
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const playClickSound = () => {
    const audio = new Audio(clickSound);
    audio.play();
  };

  const fetchNotification = async () => {
    try {   
      const response = await axios.post(API_BASE_URL + '/api/getNotifications', { userFullName: fullName });
      setNotification(response.data);
    } catch (error) {
      console.error('Error fetching notification:', error);
    }
  };

  const handleNotificationClick = () => {
    fetchNotification();
    playClickSound();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <header className="columns is-mobile" key={language}>
      <div className="column">
        <h1 className="is-size-5-tablet has-text-centered">{t('head')}</h1>
      </div>
      <div className="amd">
        <span className="menu-icon" onClick={toggleDropdown}>
          <i title={t('More')} className="fa fa-ellipsis-v dot" aria-hidden="true"></i>
          {showDropdown && (
            <div className="dropdown">
              <ul>
                <li onClick={changeLanguage}>
                  <i className="fa fa-language"></i>
                  <span>{t('Translate')}</span>
                </li>
                <li onClick={handleNotificationClick}>
                  <i className="fa fa-bell"></i>
                  <span>{t('Notifications')}</span>
                </li>
              </ul>
            </div>
          )}
        </span>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="notification-header">
              <h3 className='NotificationHeading'>Notification</h3>
              <span className="close" title={t('close')} onClick={closeModal}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-x"
                  viewBox="0 0 16 16"
                ></svg>
              </span>
            </div>

            {/* Render notification details if notification is not null */}
            {notification.notifications && notification.notifications.length > 0 ? (
              <div className="notification-details">
                {notification.notifications.map((notif, index) => (
                  <div key={index} className="notification-card">
                    <p><span className='sender'>{notif.sender}</span></p>
                    <p className='message'>{notif.chat} </p>
                    <p className='date'><i class="fa fa-calendar" aria-hidden="true"></i>&nbsp;{notif.date}</p>
                    <p className='time'><i class="fa fa-clock" aria-hidden="true"></i>&nbsp;{notif.time}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No new notifications</p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default ChatHeader;
