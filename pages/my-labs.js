// 'my-labs.js'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../api';
import { useRouter } from 'next/router'; // import the useRouter hook
import styles from './my-labs.module.css'; // Import the CSS module

export default function MyLabs() {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState('test_type');
  const [filterTerms, setFilterTerms] = useState(['']);
  const [analysis, setAnalysis] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const router = useRouter(); // initialize the useRouter hook
  const [followUpQuestion, setFollowUpQuestion] = useState(''); // new state hook for the follow-up question


  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    if (!analysisId) return;  
  
    const intervalId = setInterval(async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select('result, status')
        .eq('id', analysisId)
        .single();
  
      if (error || !data) {
        console.error('Error fetching analysis result:', error);
      } else if (data.status === 'complete') {
        setAnalysis(data.result);  
        setLoading(false);  
        clearInterval(intervalId);  
      }
    }, 3000);
  
    return () => clearInterval(intervalId);  
  }, [analysisId]);

  const viewAnalysis = (id) => {
    router.push(`/analysisResult?id=${id}`);
  };

  const fetchLabs = async () => {
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

  const deleteLab = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab?')) {
      try {
        await supabase
          .from('labs')
          .delete()
          .match({ id });
        fetchLabs();
      } catch (error) {
        console.error('Error deleting lab:', error);
      }
    }
  }

  const filteredLabs = labs.filter((lab) => {
    const optionValue = lab[filterOption] ?? ""; 
    return filterTerms.some(term => optionValue.toLowerCase().includes(term.toLowerCase()));
  });

  const requestAnalysis = async () => {
    const user = supabase.auth.user();
    const filteredTests = filteredLabs.map(lab => `${lab.test_type}: ${lab.test_result}`).join(', ');

    try {
      setLoading(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filteredTests, userId: user.id, followUpQuestion }),
      });
  
      if (!response.ok) throw new Error(response.statusText);
  
      const { id } = await response.json();
      setAnalysisId(id);
      setFollowUpQuestion(''); // Clear the follow-up question input field
    } catch (error) {
      console.error('Error starting analysis:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  return (
    <div className="my-8">
      <div className="flex flex-wrap justify-between mb-6">
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
          onClick={requestAnalysis}
          disabled={loading}
        >
          Request Analysis
        </button>
        {analysisId && (
          <button
            className="ml-4 p-2 bg-green-500 text-white rounded-md"
            onClick={() => viewAnalysis(analysisId)}
          >
            View Analysis
          </button>
          
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabs.map((lab, index) => (
          <div key={index} className={`p-6 border rounded-lg shadow-lg ${styles.labCard}`}>
            <h2 className="text-xl font-semibold mb-2">{lab.test_type}</h2>
            <p className="text-gray-500 mb-2">Date: {lab.test_date}</p>
            <p className="text-gray-500 mb-4">Result: {lab.test_result}</p>
            <div className="flex space-x-4">
            <Link href={`/edit-lab/${lab.id}`}>
              <span className="text-sm cursor-pointer text-blue-500">Edit</span>
            </Link>
            <Link href={`/labs/${lab.id}`}>
              <span className="text-sm cursor-pointer text-blue-500">View</span>
            </Link>
              <button
                className="text-sm text-red-500"
                onClick={() => deleteLab(lab.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {analysis && (
        <div className="mt-8 p-6 border rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Analysis</h2>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );  
}