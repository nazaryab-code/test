// ToggleButton.js
import React from 'react';
import { useTheme } from './ThemeProvider';

const ToggleButton = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="ModeContainer">
      <button className="Mode" onClick={toggleTheme}>
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
    </div>
  );
};

export default ToggleButton;
