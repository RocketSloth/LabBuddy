import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../api';

export default function MyLabs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState('test_type');
  const [filterTerms, setFilterTerms] = useState(['']);
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    fetchLabs();
  }, []);

  async function fetchLabs() {
    try {
      setLoading(true);
      const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('labs')
        .select('*')
        .filter('user_id', 'eq', user.id);
      if (error) throw error;
      setLabs(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteLab(id) {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      await supabase
        .from('labs')
        .delete()
        .match({ id });
      fetchLabs();
    }
  }

  const filteredLabs = labs.filter((lab) => {
    const optionValue = lab[filterOption] ?? ""; // Provide a default empty string if optionValue is undefined
    return filterTerms.some(term => optionValue.toLowerCase().includes(term.toLowerCase()));
  });  

  async function requestAnalysis() {
    const filteredTests = filteredLabs.map(lab => `${lab.test_type}: ${lab.test_result}`).join(', ');
    console.log("Filtered tests: ", filteredTests);  // Log the filtered tests
  
    try {
      setLoading(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filteredTests }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Data: ", data);  // Log the parsed response data
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error: ", error);  // Log any errors
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col items-start justify-between mt-4 mb-6">
      <div className="w-full flex items-center mb-4">
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className="w-40 p-2 mr-2 bg-gray-800 text-white rounded-md outline-none"
        >
          <option value="test_type">Test Type</option>
          <option value="test_date">Test Date</option>
          <option value="test_result">Test Result</option>
        </select>
        {filterTerms.map((term, index) => (
          <input
            key={index}
            type="text"
            placeholder="Filter labs..."
            value={term}
            onChange={(e) => {
              const newTerms = [...filterTerms];
              newTerms[index] = e.target.value;
              setFilterTerms(newTerms);
            }}
            className="w-64 p-2 bg-gray-800 text-white rounded-md outline-none"
          />
        ))}
        <button
          className="ml-4 p-2 bg-blue-500 text-white rounded-md"
          onClick={() => setFilterTerms([...filterTerms, ''])}
        >
          Add Filter
        </button>
        <button
          className="ml-4 p-2 bg-blue-500 text-white rounded-md"
          onClick={() => requestAnalysis()}
        >
          Request Analysis
        </button>
      </div>

      <div className="scroll-container">
      {filteredLabs.map((lab, index) => (
        <div key={index} className="border-b border-gray-300 mt-8 pb-4">
          <h2 className="text-xl font-semibold">{lab.test_type}</h2>
          <p className="text-gray-500 mt-2 mb-2">Date: {lab.test_date}</p>
          <p className="text-gray-500 mt-2 mb-2">Result: {lab.test_result}</p>
          <Link href={`/edit-lab/${lab.id}`}>
            <a className="text-sm mr-4 text-blue-500">Edit</a>
          </Link>
          <Link href={`/labs/${lab.id}`}>
            <a className="text-sm mr-4 text-blue-500">View</a>
          </Link>
          <button
            className="text-sm mr-4 text-red-500"
            onClick={() => deleteLab(lab.id)}
          >
            Delete
          </button>
        </div>
      ))}
      </div>
      {analysis && (
        <div className="scroll-container mt-8">
          <h2 className="text-xl font-semibold">Analysis</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}