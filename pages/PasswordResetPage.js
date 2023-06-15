import { useState } from 'react';
import { supabase } from '../api';
import Link from 'next/link';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  const handlePasswordReset = async (event) => {
    event.preventDefault();

    const { error } = await supabase.auth.api.resetPasswordForEmail(email);

    if (error) {
      console.error('Error sending password reset email:', error);
      setError(error.message);
    } else {
      setEmailSent(true);
    }
  };

  return (
    <div className="container">
      <h1 className="reset-heading">Reset Password</h1>
      {!emailSent ? (
        <form onSubmit={handlePasswordReset}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Send password reset email
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
      ) : (
        <div>
          <p>A password reset link has been sent to your email.</p>
          <p>
            <Link href="/login">Return to Login</Link>
          </p>
        </div>
      )}
      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .reset-heading {
          font-size: 30px;
          color: #04AA6D; /* Change the color to your desired color */
        }

        .form-group {
          margin-bottom: 20px;
          color: #0069d9;
        }

        label {
          display: block;
          margin-bottom: 5px;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .btn-primary {
          display: block;
          width: 100%;
          padding: 10px;
          font-size: 16px;
          background-color: #007bff;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-primary:hover {
          background-color: #0069d9;
        }

        .error-message {
          color: red;
        }
      `}</style>
    </div>
  );
}
