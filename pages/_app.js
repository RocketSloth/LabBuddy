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
      <nav className="p-6 border-b border-gray-800 flex justify-between items-center">
        <div>
          <Link href="/">
            <span className="cursor-pointer text-2xl font-bold text-blue-500 hover:text-blue-300 mr-4">Home</span>
          </Link>
        </div>
        <div>
          {user && (
            <>
              <Link href="/create-post">
                <span className="cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4">Submit Labs</span>
              </Link>
              <Link href="/charts">
                <span className="cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4">Charts</span>
              </Link>
              <Link href="/my-posts">
                <span className="cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4">My Labs</span>
              </Link>
              <Link href="/profile">
                <span className="cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4">Profile</span>
              </Link>
              <button 
                onClick={() => supabase.auth.signOut()} 
                className="cursor-pointer text-2xl  text-blue-500 hover:text-blue-300 mr-4"
              >
                Logout
              </button>
            </>
          )}

        </div>
      </nav>
      <div className="py-8 px-16">
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default MyApp
