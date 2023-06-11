import Head from 'next/head'
import Link from 'next/link'
import { useUser } from './hooks/auth' // Import the authentication hook

export default function Home() {
  const user = useUser() // Use the authentication hook to get the user object

  // Check if the user is logged in
  if (!user) {
    return (
      <div className="font-sans min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12 text-white">
        <Head>
          <title>Lab Tracker</title>
        </Head>

        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-wide mt-6 mb-6 text-blue-400">Welcome to Lab Tracker</h1>
            <p className="text-xl">Track your lab results with ease and efficiency.</p>
            <div className="mt-6">
              <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Login
              </Link>
              <span className="mx-2">or</span>
              <Link href="/signup" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sign Up
              </Link>
            </div>
          </div>

          <div className="relative px-4 py-10 bg-gray-800 mx-8 md:mx-0 shadow rounded-3xl sm:p-10 mt-10">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-semibold tracking-wide mt-6 mb-6 text-blue-400">Features</h2>
              <ul className="list-disc list-inside">
                <li>Track your lab results over time</li>
                <li>View your labs in easy-to-read charts</li>
                <li>Filter labs by test type</li>
                <li>Secure and private</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If the user is logged in, render the content for authenticated users
  return (
    <div className="font-sans min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12 text-white">
      <Head>
        <title>Lab Tracker</title>
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-4xl font-bold tracking-wide mt-6 mb-6 text-blue-400">
          Welcome to Lab Tracker, {user.email}!
        </h1>
        <p className="text-xl">You are logged in.</p>
        {/* Add more content for authenticated users */}
      </div>
    </div>
  )
}
