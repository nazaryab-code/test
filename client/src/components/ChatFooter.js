import React from 'react';
import Status from './Status';
import { useTranslation } from 'react-i18next';

function ChatFooter() {
  const { t } = useTranslation();

  return (
    <footer className="columns">
      <div className="column is-hidden-mobile">
        <small><i className="fa fa-copyright" aria-hidden="true"></i> {new Date().getFullYear()} - {t('footeryogeshJha')}  <a href="https://bizency.com/" target="_blank" rel="noopener noreferrer" className="has-text-white">{t('footerbizency')}</a></small>
      </div>
      <div className="column one">
        <Status />
      </div>
    </footer>
  );
}

export default ChatFooter;
