import React from 'react';

const Notification = ({ user, text, time, onClose }) => (
  <div className="notification">
    <div>
      <strong>{user}</strong>
    </div>
    <div>{text}</div>
    <div>{time}</div>
    <button className="close-button" onClick={onClose}>
      <i className='fas fa-times-circle'></i>
    </button>
  </div>
);

export default Notification;
