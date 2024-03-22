import React, { useState, useEffect } from 'react';
import ChatArea from "./ChatArea";
import ChatSidebar from "./ChatSidebar";
import UserProfileSidebar from "./UserProfileSidebar";
import { useUserSession } from './UserSessionContext'; // Import the useUserSession hook

function ChatMain() {
  const { setUserSession } = useUserSession(); // Destructure setUserSession from useUserSession
  const [userSession, setUserSessionState] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

 

  useEffect(() => {
    // Fetch user session and selected user asynchronously when selectedUser changes
    const fetchUserData = async () => {
      try {
        console.log('Fetching user session and selected user...');
        const userSessionString = await sessionStorage.getItem('userSession');
        const userSessionData = userSessionString ? JSON.parse(userSessionString) : null;
        setUserSession(userSessionData);
        setUserSessionState(userSessionData);

        const selectedUserString = await sessionStorage.getItem('selectedUserName');
        setSelectedUser(selectedUserString);
        console.log('FetchData...', selectedUserString);
      } catch (error) {
        console.error('Error fetching user session or selected user:', error);
      }
    };

    fetchUserData();
  }, [selectedUser, setUserSession]); 

  return (
    <main className="columns">
      <UserProfileSidebar userSession={userSession} selectedUser={selectedUser} />
      <ChatArea userSession={userSession} selectedUser={selectedUser} />
      <ChatSidebar onUserSelect={setSelectedUser} />
    </main>
  );
}

export default ChatMain;
