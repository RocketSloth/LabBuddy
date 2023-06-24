import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../api';

const Container = styled.div`
  padding: 50px;
  max-width: 600px;
  margin: auto;
`;

const Title = styled.h1`
  text-align: center;
`;

const Form = styled.form`
  margin-bottom: 30px;
`;

const Input = styled.input`
  margin-right: 10px;
`;

const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
`;

const MedicationItem = styled.div`
  margin-bottom: 20px;
`;

function MedicationsPage() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  async function fetchMedications() {
    const user = supabase.auth.user();
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id);
    setMedications(data);
    setLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const user = supabase.auth.user();
    const { data, error } = await supabase
      .from('medications')
      .insert([{ user_id: user.id, name: medicationName, dosage, frequency }]);
    if (error) {
      console.error('Error: ', error);
    } else {
      setMedications([...medications, ...(data || [])]); // Spread data into array only if it is not null
      setMedicationName('');
      setDosage('');
      setFrequency('');
    }
  }
  

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <Title>My Medications</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type='text'
          placeholder='Medication Name'
          value={medicationName}
          onChange={e => setMedicationName(e.target.value)}
        />
        <Input
          type='text'
          placeholder='Dosage'
          value={dosage}
          onChange={e => setDosage(e.target.value)}
        />
        <Input
          type='text'
          placeholder='Frequency'
          value={frequency}
          onChange={e => setFrequency(e.target.value)}
        />
        <Button type='submit'>Submit</Button>
      </Form>
      {medications && medications.map((medication) => (
        <MedicationItem key={medication.id}>
          <div><strong>Name:</strong> {medication.name}</div>
          <div><strong>Dosage:</strong> {medication.dosage}</div>
          <div><strong>Frequency:</strong> {medication.frequency}</div>
        </MedicationItem>
      ))}
    </Container>
  );
}

export default MedicationsPage;