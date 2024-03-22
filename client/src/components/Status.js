import React from 'react';
import { useEffect, useState } from 'react';
import socket from '../Socket';
import { useTranslation } from 'react-i18next';

function Status() {
  const { t } = useTranslation();
  const [status, setStatus] = useState('info');
  const [text, setText] = useState('Connecting...');

  useEffect(() => {
    function onConnect() {
      setStatus('');
      setText(t('online'));
    }

    function onError(error) {
      setStatus('danger');
      setText(error.message);
    }

    // Connect
    socket.on('connect', onConnect);

    // Connect error
    socket.on('connect_error', onError);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
    };
  }, [t]); // Add t to the dependency array

  return (
    <small >{t('status')} <span className={"statuso has-text-" + (status)}>{text}</span></small>
  );
}

export default Status;
