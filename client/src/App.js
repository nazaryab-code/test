import React, { useState } from 'react';
import ChatFooter from './components/ChatFooter';
import ChatHeader from './components/ChatHeader';
import ChatMain from './components/ChatMain';
import { MessagesProvider } from './contexts/MessagesContext';
import { UserSessionProvider } from '../src/components/UserSessionContext'; // Import the UserSessionProvider
import './styles/App.css';

function App() {
  const [isArabic, setIsArabic] = useState(false);

  const handleLanguageChange = () => {
    console.log('Language changed');
    setIsArabic(prevIsArabic => !prevIsArabic);
  };

  return (
    <UserSessionProvider>
      <MessagesProvider>
        <div className="hero is-fullheight has-text-white is-unselectable is-size-6">
          <div className="hero-body">
            <div className="container">
              <ChatHeader title="Bizmo Chat" onLanguageChange={handleLanguageChange} />
              <ChatMain isArabic={isArabic} />
              <ChatFooter />
            </div>
          </div>
        </div>
      </MessagesProvider>
    </UserSessionProvider>
  );
}

export default App;
