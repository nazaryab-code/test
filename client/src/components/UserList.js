import React, { useEffect, useState } from 'react';
import img from '../styles/user1.png';
import API_BASE_URL from './apiConfig';
import { useTranslation } from 'react-i18next';

function UserList({onUserSelect}) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();
  console.log('setselected from cm ',selectedUser);
  useEffect(() => {
    async function fetchUsers() {
      try {
        //const userSession = JSON.parse(sessionStorage.getItem('userSession'));
        

        const response = await fetch(API_BASE_URL + '/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const userData = await response.json();
        setUsers(userData);
        localStorage.setItem('activeUsers', JSON.stringify(userData));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
    fetchUsers();
  }, []);

  // Inside handleSelectUser function
const handleSelectUser = (user) => {
  // Remove previous selected user's data
  sessionStorage.removeItem('selectedUserName');
  sessionStorage.removeItem('selectedUserEmail');

  setSelectedUser(user.full_name);
  onUserSelect(user.full_name);
  // Store selected user's name and email in session
  sessionStorage.setItem('selectedUserName', user.full_name);
  sessionStorage.setItem('selectedUserEmail', user.email);

  // Retrieve user email from state
  // const userEmail = userEmails[user];
  console.log('Selected user:', user);
  console.log('User email:', user.email);
};



  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='h-100 position-relative'>
      <div id="activeUsersList" className="scrollable-content">
        <div className="main1 field has-text-centered">
          <div className="search-bar control has-icons-left has-icons-right">
            <input
              className='main2'
              type="text"
              placeholder={t('Search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="jeft icon is-small is-left">
              <i className="fas fa-search"></i>
            </span>
          </div>
          <ul className="user-list scrollable-content">
            {filteredUsers.map((user, index) => (
              <li key={index}>
                <div
                  className={`user-card`}
                  onClick={() => handleSelectUser(user)}
                >
                  <img className="user-image" src={img} alt="User" />
                  <div className="user-info">
                    <p className="user-name">{user.full_name}</p>
                    <p className="user-message tool1">
                      <i className="fa fa-envelope" aria-hidden="true"></i> {user.email}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default UserList;
