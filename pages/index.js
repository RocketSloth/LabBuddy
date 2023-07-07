import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../api';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';
import useUser from './hooks/auth';
import { useRouter } from 'next/router';

// Options for select inputs
const feelingOptions = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'okay', label: 'Okay' },
  { value: 'bad', label: 'Bad' },
  { value: 'terrible', label: 'Terrible' },
];

const hoursOptions = Array.from({length: 25}, (_, i) => ({value: i, label: `${i} hours`}));
const waterIntakeOptions = Array.from({length: 21}, (_, i) => ({value: i, label: `${i} cups`}));


const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #0000;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,1);
  margin-bottom: 20px;
`;

const Label = styled.label`
  font-size: 18px;
  color: #ffff;
  margin: 10px 0;
  width: 100%;
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #dddddd;
  width: 100%;
`;

const Button = styled.button`
  background-color: #036AB7;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
`;

function DailyCheckIn() {
  const [dailyCheck, setDailyCheck] = useState({
    feeling: '',
    weight: '',
    sleepHours: '',
    exerciseHours: '',
    waterIntake: '',
  });

  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const getDailyCheck = async () => {
      if (user?.id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
    
        const { data, error } = await supabase
          .from('daily_checks')
          .select('*')
          .eq('user_id', user.id)
          .range('date', today.toISOString(), tomorrow.toISOString())
        
        if (error) {
          console.error('Error fetching daily check:', error);
        } else if (data && data.length > 0) {
          // If a check has been made, redirect to the dashboard
          router.push('/dashboard');
        }
      }
    };
  
    getDailyCheck();
  }, [user]);

  

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = supabase.auth.user();
    const { data, error } = await supabase
      .from('daily_checks')
      .upsert([
        { 
          feeling: dailyCheck.feeling.value,
          weight: parseFloat(dailyCheck.weight),
          sleep_hours: dailyCheck.sleepHours.value,
          exercise_hours: dailyCheck.exerciseHours.value,
          water_intake: dailyCheck.waterIntake.value,
          user_id: user.id,
          date: new Date().toISOString() // current date in UTC
        },
      ]);

    if (error) {
      console.error('Error saving daily check:', error);
    } else {
      alert('Daily check saved successfully.');
      setDailyCheck({
        feeling: '',
        weight: '',
        sleepHours: '',
        exerciseHours: '',
        waterIntake: '',
      });
    }
  };

  const customStyles = {
    control: (provided) => ({...provided, backgroundColor: '#ffff', color: '#0000'}),
    singleValue: (provided) => ({...provided, color: '#000'}),
    option: (provided) => ({...provided, color: '#000'}),
  }

  return (
    <Form onSubmit={handleSubmit}>

      <Label>
        How are you feeling today?
        <Select
          styles={customStyles}
          options={feelingOptions}
          value={dailyCheck.feeling}
          onChange={(selectedOption) => setDailyCheck({ ...dailyCheck, feeling: selectedOption })}
        />
      </Label>

      <Label>
        What's your current weight?
        <Input
          type="text"
          value={dailyCheck.weight}
          onChange={(e) => setDailyCheck({ ...dailyCheck, weight: e.target.value })}
        />
      </Label>

      <Label>
        How many hours did you sleep last night?
        <Select
          styles={customStyles}
          options={hoursOptions}
          value={dailyCheck.sleepHours}
          onChange={(selectedOption) => setDailyCheck({ ...dailyCheck, sleepHours: selectedOption })}
        />
      </Label>

      <Label>
        How many hours did you exercise today?
        <Select
          styles={customStyles}
          options={hoursOptions}
          value={dailyCheck.exerciseHours}
          onChange={(selectedOption) => setDailyCheck({ ...dailyCheck, exerciseHours: selectedOption })}
        />
      </Label>

      <Label>
        How many cups of water did you drink today?
        <Select
          styles={customStyles}
          options={waterIntakeOptions}
          value={dailyCheck.waterIntake}
          onChange={(selectedOption) => setDailyCheck({ ...dailyCheck, waterIntake: selectedOption })}
        />
      </Label>

      <Button type="submit">
        Submit
      </Button>
    </Form>
  );
}

export default function Home() {
  const user = useUser()

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

  return (
    <div className="font-sans min-h-screen bg-lightGray py-6 flex flex-col justify-center sm:py-12 text-white">
      <Head>
        <title>Lab Tracker</title>
      </Head>
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-4xl font-bold tracking-wide mt-6 mb-6 text-blue-400">
          Welcome to Lab Tracker, {user.email}!
        </h1>
        <p className="text-xl">Please fill out the below form only once a day.</p>

        <DailyCheckIn />
      </div>
    </div>
  );
}