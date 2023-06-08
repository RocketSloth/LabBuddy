import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabase } from '../api'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(checkUser)
    checkUser()
    return () => {
      authListener?.unsubscribe()
    };
  }, [])
  
  function checkUser() {
    const user = supabase.auth.user()
    setUser(user)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="p-6 border-b border-gray-800">
        <Link href="/">
          <a className="m-6 text-blue-400 hover:text-blue-500">Home</a>
        </Link>
        {
          user && (
            <Link href="/create-post">
              <a className="m-6 text-blue-400 hover:text-blue-500">Submit Labs</a>
            </Link>
          )
        }
        {
          user && (
            <Link href="/my-posts">
              <a className="m-6 text-blue-400 hover:text-blue-500">My Labs</a>
            </Link>
          )
        }
        <Link href="/profile">
          <a className="m-6 text-blue-400 hover:text-blue-500">Profile</a>
        </Link>
      </nav>
      <div className="py-8 px-16">
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default MyApp
