// 'retrieveAnalysisButton.js'
import { useRouter } from 'next/router';

export default function RetrieveAnalysisButton({ id }) {
  const router = useRouter();

  const retrieveAnalysis = () => {
    router.push(`/analysisResult?id=${id}`);
  };

  return (
    <button onClick={retrieveAnalysis}>
      Retrieve Analysis
    </button>
  );
}
