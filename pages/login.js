import { useState, useEffect } from 'react';
import { Auth } from '@supabase/ui';
import { supabase } from '../api';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import the Link component here



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = supabase.auth.session();

    if (session) {
      router.push('/'); // Redirect to home if user is already logged in
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    const { user, error } = await supabase.auth.signIn({
      email,
      password,
    });

    if (error) {
      setLoginError(error.message);
    } else {
      console.log('Logged in successfully:', user);
      router.push('/');
    }
  };

  return (
    <div className="container">
      <h1 className="login-heading">Login Page</h1>
      <form onSubmit={handleLogin}>
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
        <button className="btn btn-primary" type="submit">
          Log in
        </button>
        {loginError && <p className="error-message">{loginError}</p>}
      </form>
      <Link href="/PasswordResetPage">Forgot your password?</Link>

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
        }

        .login-heading {
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
      `}</style>
    </div>
  );
}
