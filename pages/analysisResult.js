// 'pages/analysisResult.js'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function AnalysisResult() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const id = router.query.id;
      const response = await axios.get(`/api/retrieveAnalysis?id=${id}`);
      setAnalysis(response.data);
    };

    fetchAnalysis();
  }, [router.query.id]);

  if (!analysis) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Analysis Result</h1>
      <p>{analysis.result}</p>
    </div>
  );
}
