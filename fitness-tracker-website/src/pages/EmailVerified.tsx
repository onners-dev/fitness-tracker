import React, { useEffect } from 'react';
import './EmailVerification.css';

const EmailVerified = () => {
  useEffect(() => {
    // Automatically set first-time setup flag
    localStorage.setItem('firstTimeSetup', 'true');
  }, []);

  return (
    <div className="email-verification-page">
      <div className="email-verification-container">
        <h2>Email Verified</h2>
        
        <div className="verification-instructions">
          <p>Your email has been successfully verified.</p>
          <p>You can now close this tab and continue with profile setup on the original page.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;
