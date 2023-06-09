// '_app.js'

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../api';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(checkUser);
    checkUser();
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  function checkUser() {
    const user = supabase.auth.user();
    setUser(user);
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <nav className='p-6 border-b border-gray-800 flex justify-between items-center'>
        <div>
          {user && (
            <>
              <Link href='/dashboard'>
                <span className='cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4'>Dashboard</span>
              </Link>
              <Link href='/create-post'>
                <span className='cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4'>Submit Labs</span>
              </Link>
              <Link href='/charts'>
                <span className='cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4'>Charts</span>
              </Link>
              <Link href='/my-labs'>
                <span className='cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4'>My Labs</span>
              </Link>
              <Link href='/medications'>
                <span className='cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4'>Medications</span>
              </Link>
              <Link href='/profile'>
                <span className='cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4'>Profile</span>
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className='cursor-pointer text-2xl  text-blue-500 hover:text-red-300 mr-4'
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
      <div className='py-8 px-16'>
        <Component {...pageProps} />
      </div>
    </div>
  );
}

export default MyApp;
