import React, { useEffect, useState } from 'react';
import { supabase } from '../api';
import Link from 'next/link';
import styled from 'styled-components';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  color: black;
`;

const Header = styled.h1`
  font-size: 40px;
  color: #000000;
  margin-bottom: 40px;
`;

const Button = styled.button`
  background-color: #036AB7;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

function Dashboard() {
  const user = supabase.auth.user();
  const [dailyChecks, setDailyChecks] = useState([]);

  useEffect(() => {
    const fetchDailyChecks = async () => {
      const { data, error } = await supabase
        .from('daily_checks')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching daily checks:', error);
      } else {
        setDailyChecks(data);
      }
    };

    fetchDailyChecks();
  }, []);

  return (
    <Container>
      <Header>Dashboard</Header>

      <LineChart width={500} height={300} data={dailyChecks}>
        <Line type="monotone" dataKey="sleep_hours" stroke="#8884d8" />
        <Line type="monotone" dataKey="exercise_hours" stroke="#82ca9d" />
        <Line type="monotone" dataKey="water_intake" stroke="#ffc658" />
        <CartesianGrid stroke="#3d3d3d" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
      </LineChart>

      <BarChart width={500} height={300} data={dailyChecks}>
        <Bar dataKey="feeling" fill="#68a17d" />
        <CartesianGrid stroke="#3d3d3d" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
      </BarChart>
    </Container>
  );
}

export default Dashboard;
