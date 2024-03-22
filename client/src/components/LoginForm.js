import React, { useState } from 'react';
import '../styles/loginForm.css';
import API_BASE_URL from './apiConfig';
import { useTranslation } from 'react-i18next';

function LoginForm({ setLogin, setUserName }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(API_BASE_URL + '/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userSession = await response.json();
        sessionStorage.setItem('userSession', JSON.stringify(userSession));
        console.log('usersSession ', userSession); 
        console.log('usersSession ', userSession.full_name); 
        setLogin(true);
        setUserName(userSession);
      } else {
        const errorData = await response.json();
        setLoginMessage(errorData.error || 'Invalid credentials');
      }      
    } catch (error) {
      console.error('Error during login:', error);
      setLoginMessage(`Internal Server Error: ${error.message}`);
    }
  };

  return (
    <div className="loginform column is-half is-offset-one-quarter">
      <form className="" onSubmit={handleLogin}>
        <div className="field">
          <div className="control has-icons-left">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              type="text"
              placeholder={t('username')}
              required
            />
            <span className="icon is-small is-left">
              <i className="fas fa-user icon1"></i>
            </span>
          </div>
        </div>

        <div className="field">
          <div className="control has-icons-left has-icons-right">
            
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder={t('password')}
              required
            />
            <span
              className={`icon is-small is-right ${showPassword ? 'active' : ''}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </span>
            <span className="icon is-small is-left">
              <i className="fas fa-lock"></i>
            </span>
            
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button className="button is-primary" type="submit">
              <i className="fas fa-lock" aria-hidden="true"></i> &nbsp;
              {t('login')}
            </button>
          </div>
        </div>
        <p className={`help is-danger ${loginMessage ? '' : 'is-hidden'}`}>{loginMessage}</p>
      </form>
    </div>
  );
}

export default LoginForm;
