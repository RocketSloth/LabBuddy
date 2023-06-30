import React, { useState, useEffect } from 'react';
import { supabase } from '../api';
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const Medications = () => {
  const [medications, setMedications] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [explanation, setExplanation] = useState("");

  useEffect(() => {
    fetchMedications();
  }, []);

  useEffect(() => {
    if (selectedMedication) {
      explainMedication(selectedMedication.name);
    }
  }, [selectedMedication]);

  async function fetchMedications() {
    const { data, error } = await supabase.from('medications').select('*');
    if (error) console.log('error', error);
    else setMedications(data);
  }

  async function addMedication() {
    const { data, error } = await supabase.from('medications').insert([{ name, dosage, frequency }]);
    if (error) console.log('error', error);
    else fetchMedications();
  }

  async function explainMedication(medicationName) {
    const prompt = "What is " + medicationName + " used for and how should it be taken?";

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
      });

      setExplanation(completion.data.choices[0].message.content);
    } catch (error) {
      console.error('Failed to fetch explanation from OpenAI API:', error);
    }
  }

  function handleMedicationClick(medication) {
    setSelectedMedication(medication);
  }

  return (
    <div className="p-12 mx-auto max-w-lg">
      <h1 className="text-2xl text-white font-bold mb-4">Medications</h1>
      {medications.map((medication) => (
        <div key={medication.id} onClick={() => handleMedicationClick(medication)} className="mb-4 p-4 border border-gray-200 rounded">
          <p className="text-lg">{medication.name}</p>
          <p>{medication.dosage}</p>
          <p>{medication.frequency}</p>
          <button onClick={(e) => { e.stopPropagation(); explainMedication(medication.name); }} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Explain this Medication</button>
        </div>
      ))}
      {selectedMedication && (
        <div className="mt-6 p-4 bg-gray-100 border border-gray-200 rounded">
          <h2 className="text-lg font-semibold">{selectedMedication.name}</h2>
          <p>{selectedMedication.dosage}</p>          
          <p>{selectedMedication.frequency}</p>
          <p>{explanation}</p>
        </div>
      )}
      <div className="mt-6">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Medication Name" className="p-2 border text-black border-gray-200 rounded w-full mb-2"/>
        <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage" className="p-2 border text-black border-gray-200 rounded w-full mb-2"/>
        <input type="text" value={frequency} onChange={e => setFrequency(e.target.value)} placeholder="Frequency" className="p-2 border text-black border-gray-200 rounded w-full mb-2"/>
        <button onClick={addMedication} className="px-4 py-2 bg-blue-500 text-white rounded w-full">Add Medication</button>
      </div>
    </div>
  );
};

export default Medications;
