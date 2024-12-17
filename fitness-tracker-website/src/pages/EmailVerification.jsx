import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const [message, setMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      try {
        const response = await axios.get(`/api/verify-email?token=${token}`);
        setMessage(response.data.message);
      } catch (error) {
        setMessage('Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [location]);

  return <div>{message}</div>;
};

export default EmailVerification;
