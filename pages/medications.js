import { supabase } from '../api';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/solid';

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [explanation, setExplanation] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [checkCompatibilityClicked, setCheckCompatibilityClicked] = useState(false);
  const [liveResponse, setLiveResponse] = useState("");

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    if (medications.length > 0 && checkCompatibilityClicked) {
      checkCompatibility();
      setCheckCompatibilityClicked(false);
    }
  }, [medications, checkCompatibilityClicked]);

  useEffect(() => {
    if (selectedMedication && selectedMedication.name) {
      explainMedication(selectedMedication);
    }
  }, [selectedMedication]);

  async function fetchMedications() {
    const user = supabase.auth.user();
    if (!user) {
      // User is not logged in. You should handle this case.
      return;
    }
    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id);
    if (error) console.log('error', error);
    else setMedications(data);
  }

  async function addMedication() {
    const { data, error } = await supabase.from('medications').insert([{ name, dosage, frequency }]);
    if (error) console.log('error', error);
    else fetchMedications();
  }

  async function explainMedication(medication) {
    const prompt = `What is ${medication.name} used for, what is its recommended dosage, and how often should it be taken?`;
  
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
  
      if (!response.ok) {
        console.error('Failed to fetch explanation from OpenAI API:', response.statusText);
        return;
      }
  
      const reader = response.body.getReader();
      let result = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = new TextDecoder().decode(value);
        result += chunk;
        setExplanation(result);
      }
  
      const data = JSON.parse(result);
      if (data.choices && data.choices.length > 0) {
        setExplanation(data.choices[0].message.content);
      } else {
        setExplanation('No explanation available.');
      }
    } catch (error) {
      console.error('Failed to fetch explanation from OpenAI API:', error);
    }
  }
  
  

  async function checkCompatibility() {
    const medicationNames = medications.map((m) => m.name).join(', ');
    const prompt = `Can the following medications be taken together: ${medicationNames}?`;
  
    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a pharmacist who has been educated on all known drugs and their compatibility with other medications.' },
            { role: 'user', content: prompt },
          ],
        }),
      });
  
      if (!response.ok) {
        console.error('Failed to fetch compatibility info from OpenAI API:', response.statusText);
        return;
      }
  
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        setCompatibility(data.choices[0].message.content);
      } else {
        setCompatibility('Compatibility information not available.');
      }
    } catch (error) {
      console.error('Failed to fetch compatibility info from OpenAI API:', error);
    }
  }  

  return (
    <div className="container mx-auto mt-8">
      <Link href="/labs" className="text-blue-600 hover:text-blue-800">
        Back to Labs
      </Link>
      <h1 className="text-2xl mt-6 mb-4">Medications</h1>
      {medications.map((medication) => (
        <div key={medication.id} className="mb-4 p-4 bg-black border border-gray-200 rounded">
          <p className="text-lg font-semibold">{medication.name}</p>
          <p className="mt-1">{medication.dosage}</p>
          <p className="mt-1">{medication.frequency}</p>
          <button onClick={() => setSelectedMedication(medication)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Explain this Medication</button>
        </div>
      ))}
      {selectedMedication && (
        <div className="mt-6 p-4 bg-black border border-gray-200 rounded">
          <h2 className="text-lg font-semibold">{selectedMedication.name}</h2>
          <p className="mt-1">{selectedMedication.dosage}</p>          
          <p className="mt-1">{selectedMedication.frequency}</p>
          <p className="mt-1">{explanation}</p>
        </div>
      )}
      <div className="mt-6">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Medication Name" className="p-2 border border-gray-200 rounded w-full mb-2"/>
        <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage" className="p-2 border border-gray-200 rounded w-full mb-2"/>
        <input type="text" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Frequency" className="p-2 border border-gray-200 rounded w-full mb-2"/>
        <button onClick={addMedication} className="px-4 py-2 bg-blue-500 text-white rounded w-full">Add Medication</button>
      </div>
      {medications.length > 1 && (
        <div className="mt-6">
          <button onClick={() => setCheckCompatibilityClicked(true)} className="px-4 py-2 bg-blue-500 text-white rounded">Check Compatibility</button>
          <p className="mt-2">{compatibility}</p>
        </div>
      )}
    </div>
  );
};

export default Medications;
