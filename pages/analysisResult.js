import { useState, useEffect } from "react";
import { supabase } from '../api';

const followUpQuestions = [
  "Can you tell me more about this?",
  "What are the implications of this?",
  "How can I apply this information?",
  "What's the next step?",
  // Add more questions here
];

export default function AnalysisResult() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [retries, setRetries] = useState(0);  // State for tracking number of retries

  const user = supabase.auth.user();

  useEffect(() => {
    // Start polling
    const intervalId = setInterval(async () => {
      const { data: newAnalysis, error: fetchError } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false }) // Added this line
        .limit(1)
        .single();
  
      if (fetchError) {
        setError(fetchError.message);
        clearInterval(intervalId);  // Stop polling in case of error
      }
  
      // If the analysis is complete, stop polling
      if (newAnalysis && newAnalysis.status === 'complete') {
        setAnalysis(newAnalysis);
        setLoading(false);
        clearInterval(intervalId);
      }
  
      // If we've tried too many times, stop polling
      if (retries > 10) {
        setError('Analysis is taking too long. Please try again later.');
        clearInterval(intervalId);
      }
  
      setRetries(retries + 1);  // Increment number of retries
    }, 3000);
  
    // Clean up function to clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [user.id, retries]);  // Add 'retries' as a dependency
  

  const handleFollowUpQuestion = async (question) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          followUpQuestion: question,
          previousAIResponse: analysis.result,  // Add the previous AI response here
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Analysis Result</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {analysis && <p>{analysis.result}</p>}
          {followUpQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleFollowUpQuestion(question)}
              disabled={loading}
              style={{
                backgroundColor: 'blue',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '10px 20px',
                margin: '10px',
                cursor: 'pointer',
              }}
            >
              {question}
            </button>
          ))}
        </>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}
