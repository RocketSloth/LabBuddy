import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { supabase } from '../api'

export default function Charts() {
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTestType, setSelectedTestType] = useState('');

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('labs')
      .select()
    setLabs(data)
    setLoading(false)
  }

  const filteredLabs = selectedTestType && labs.length ? labs.filter(lab => lab.test_type === selectedTestType) : labs;

  const chartData = filteredLabs && filteredLabs.length ? filteredLabs.map((lab) => ({
    name: new Date(lab.test_date).getTime(),
    result: lab.test_result,
    unit: lab.test_unit,
  })) : [];

  // Calculating min and max for Y-Axis
  let minVal = chartData.length ? Math.min(...chartData.map(data => data.result)) : 0;
  let maxVal = chartData.length ? Math.max(...chartData.map(data => data.result)) : 0;

  // Unique Test Types
  const uniqueTestTypes = labs && labs.length ? [...new Set(labs.map(lab => lab.test_type))] : [];

  const chart = (
    <ResponsiveContainer width="100%" aspect={1}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }} scale="time" domain={['auto', 'auto']} tickFormatter={(unixTime) => moment(unixTime).format('YYYY-MM-DD')} />
        <YAxis dataKey="result" label={{ value: 'Result', angle: -90, position: 'insideLeft' }} domain={[minVal, maxVal]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="result" stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  if (loading) return <p className="text-2xl">Loading...</p>;
  if (!filteredLabs.length) return <p className="text-2xl">No labs.</p>;

  return (
    <div className="font-sans min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12 text-white">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-2xl text-center font-semibold tracking-wide mt-6 mb-6 text-blue-400">Charts</h1>
        <div className="relative px-4 py-10 bg-gray-800 mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <select
                onChange={e => setSelectedTestType(e.target.value)}
                value={selectedTestType}
                className="w-full p-2 border-2 rounded-lg border-blue-500 bg-gray-700 text-white outline-none"
              >
                <option value="">-- Please choose a test type --</option>
                {uniqueTestTypes.map((type, index) => (
                  <option value={type} key={index}>{type}</option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <h2 className="text-xl font-semibold tracking-wide mt-6 mb-6 text-blue-400">{selectedTestType}</h2>
              {chart}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}