// auth.js
import { useEffect, useState } from 'react'
import { supabase } from '../../api' // Import your Supabase client configuration

export default function useUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = supabase.auth.session()

    // Check if there is an active session
    if (session) {
      // Update the user state with the session user
      setUser(session.user)
    } else {
      // If no active session, set user state to null
      setUser(null)
    }

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    // Clean up the subscription on unmount
    return () => {
      authListener.unsubscribe()
    }
  }, [])

  return user
}
