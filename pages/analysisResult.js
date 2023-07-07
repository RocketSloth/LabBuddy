// 'analysisResult.js'

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
  const [analysis, setAnalysis] = useState([]);  // Initialize analysis as an empty array
  const [processingFollowUp, setProcessingFollowUp] = useState(false);  // New state to track when a follow-up question is being processed

  const user = supabase.auth.user() || {}; // Fallback to empty object if user is null

  useEffect(() => {
    if (user.id) {
      const intervalId = setInterval(async () => {
        const { data: newAnalysis, error: fetchError } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(1)
          .single();
  
        if (fetchError) {
          setError(fetchError.message);
          clearInterval(intervalId);
        }
  
        if (newAnalysis && newAnalysis.status === 'complete') {
          if (!analysis.length || newAnalysis.id !== analysis[analysis.length - 1].id) {
            setAnalysis(prev => [...prev, newAnalysis]);
            setLoading(false);
            setProcessingFollowUp(false);
          }
        }
      }, 3000);
  
      // Clear the interval when the component is unmounted
      return () => clearInterval(intervalId);
    }
  }, [user.id, processingFollowUp]);
  
  const handleFollowUpQuestion = async (question) => {
    setLoading(true);
    setError(null);
    setProcessingFollowUp(true);  // We're about to process a new follow-up question

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          followUpQuestion: question,
          previousAIResponse: analysis[analysis.length]?.result,  // Add the previous AI response here
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);  // Only set loading to false here in case of error
    }
  };

  return (
    <div>
    <h1 style={{
        textAlign: 'center',
        fontSize: '32px',
        color: '#444',
        fontWeight: 'bold',
        marginBottom: '20px',
        fontFamily: 'Arial, sans-serif',
      }}>
      Analysis Result
    </h1>
    {loading ? (
      <p>Loading...</p>
    ) : (
        <>
          {analysis.map((result, index) => (
            <div 
              key={index} 
              style={{
                backgroundColor: 'lightgrey', 
                color: 'black', 
                border: '1px solid darkgrey', 
                borderRadius: '5px', 
                padding: '10px 20px', 
                margin: '10px 0',
                wordWrap: 'break-word'
              }}
            >
              <p>{result.result}</p>  
            </div>
          ))}

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