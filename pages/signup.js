import { useState } from 'react';
import { Auth, Button, Typography } from '@supabase/ui';
import { supabase } from '../api';

const { Text } = Typography;

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { user, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Signup error:', error);
    } else {
      console.log('Signed up successfully:', user);
      // Handle successful signup, e.g., redirect to another page
    }
  };

  return (
    <div className="container">
      <h1 className="title">Signup Page</h1>
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
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          className="form-control"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="btn btn-primary" onClick={handleSignup}>
        Sign up
      </button>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .title {
          font-size: 24px;
          color: #ff5500;
        }

        .form-group {
          margin-bottom: 20px;
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
      `}</style>
    </div>
  );
}
