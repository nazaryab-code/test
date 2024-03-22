import React, { useState, useEffect } from 'react';
import '../styles/profile.css';
import userImage from '../styles/user1.png';
import API_BASE_URL from './apiConfig'; 
import { useTranslation } from 'react-i18next';

const UserProfile = ({ user }) => {
  const { t } = useTranslation();
  const [showTransaction, setShowTransaction] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  const handleToggleTransaction = () => {
    setShowTransaction(!showTransaction);
    setShowOrder(false);
  };

  const handleToggleOrder = () => {
    setShowOrder(!showOrder);
    setShowTransaction(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfoResponse = await fetch(API_BASE_URL + '/api/getUserInfoByName', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ full_name: user }),
        });

        if (!userInfoResponse.ok) {
          throw new Error(`User Info HTTP error! Status: ${userInfoResponse.status}`);
        }

        const userInformation = await userInfoResponse.json();
        setUserInfo(userInformation);

        if (showTransaction) {
          const transactionsResponse = await fetch(API_BASE_URL + '/api/userTransactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ full_name: user }),
          });

          if (!transactionsResponse.ok) {
            throw new Error(`Transactions HTTP error! Status: ${transactionsResponse.status}`);
          }

          const userTransactions = await transactionsResponse.json();
          setTransactions(userTransactions);
        } else if (showOrder) {
          const ordersResponse = await fetch(API_BASE_URL + '/api/userOrderDetails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ full_name: user }),
          });

          if (!ordersResponse.ok) {
            throw new Error(`Orders HTTP error! Status: ${ordersResponse.status}`);
          }

          const userOrderDetails = await ordersResponse.json();
          setOrders(userOrderDetails);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user, showTransaction, showOrder]);

  return (
    <div className="profile-card">
      <div className="profile-cover"></div>
      <div className="profile-image-container">
        <div className="profile-image">
          <img src={userImage} alt="" />
        </div>
      </div>
      <h1 className="profile-name">{user}</h1>
      <div className="scrollable-content">
        <table className="profile-details">
          <tbody>
            <tr>
              <td>{t('email')}</td>
              <td title={userInfo.email} className="table-cell-ellipsis">: {userInfo.email}</td>
            </tr>
            <tr>
              <td>{t('phone')}</td>
              <td title={userInfo.phone} className="table-cell-ellipsis">: {userInfo.phone}</td>
            </tr>
            <tr>
              <td>{t('address')}</td>
              <td title={userInfo.address} className="table-cell-ellipsis">: {userInfo.address}</td>
            </tr>
            <tr>
              <td>{t('country')}</td>
              <td title={userInfo.country} className="table-cell-ellipsis">: {userInfo.country}</td>
            </tr>
            <tr>
              <td>{t('project')}</td>
              <td title={userInfo.project} className="table-cell-ellipsis">: {userInfo.project}</td>
            </tr>
            <tr>
              <td>{t('invoice')}</td>
              <td title={userInfo.invoice} className="table-cell-ellipsis">: {userInfo.invoice}</td>
            </tr>
            <tr>
              <td>{t('deadline')}</td>
              <td title={userInfo.deadline} className="table-cell-ellipsis">: {userInfo.deadline}</td>
            </tr>
            <tr>
              <td>{t('budget')}</td>
              <td title={userInfo.budget}  className="table-cell-ellipsis">: {userInfo.budget}</td>
            </tr>
          </tbody>
        </table>
        <div className="profile-footer">
          <hr />
          <div className="button-container">
            <button
              className={`btn btn-link ${showTransaction ? 'active' : ''}`}
              onClick={handleToggleTransaction}
            >
              <i className="fa fa-university" aria-hidden="true"></i> {t('Transaction')}
            </button>
            <button
              className={`btn btn-link ${showOrder ? 'active' : ''}`}
              onClick={handleToggleOrder}
            >
              <i className="fa fa-shopping-cart" aria-hidden="true"></i> {t('Order')}
            </button>
          </div>
          {showTransaction && (
            <div className="">
              <h2>{t('Transaction')} {t('Details')}</h2>
              <table className="table table-hover full-width-table">
                <thead>
                  <tr>
                    <th>{t('serial')}</th>
                    <th>{t('Product')}</th>
                    <th>{t('Date')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index + 1}>
                      <td>{index + 1}</td>
                      <td>{transaction.product}</td>
                      <td>{transaction.date}</td>
                      <td>{transaction.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showOrder && (
            <div className="">
              <h2>{t('Order')} {t('Details')}</h2>
              <table className="table table-hover full-width-table">
                <thead>
                  <tr>
                    <th>{t('serial')}</th>
                    <th>{t('Product')}</th>
                    <th>{t('Quantity')}</th>
                    <th>{t('status')}</th>
                  </tr>
                </thead>
                <tbody>
                {orders.map((order, index) => (
                      <tr key={index + 1}>
                        <td>{index + 1}</td>
                        <td>{order.product}</td>
                        <td>{order.quantity}</td>
                        <td>{order.status}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
