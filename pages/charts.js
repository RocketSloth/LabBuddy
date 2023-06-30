//'charts.js'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { supabase } from '../api'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white p-3 border rounded">
        <p className="label">{`Date : ${moment(label).format('MM-DD-YYYY')}`}</p>
        <p className="label">{`Result : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default function Charts() {
  const [labs, setLabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChart, setSelectedChart] = useState(null);
  const [dashboardCharts, setDashboardCharts] = useState([]);

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    const user = supabase.auth.user();
    if (!user) {
      // User is not logged in. You should handle this case.
      return;
    }

    const { data, error } = await supabase
      .from('labs')
      .select()
      .eq('user_id', user.id);
    setLabs(data);
    setLoading(false);
  }



  // Unique Test Types
  const uniqueTestTypes = labs && labs.length ? [...new Set(labs.map(lab => lab.test_type))] : [];

  const handleSelectChart = (event) => {
    const { value } = event.target;
    setSelectedChart(value);
  }

  const handleAddToDashboard = () => {
    if (selectedChart && !dashboardCharts.includes(selectedChart)) {
      setDashboardCharts([...dashboardCharts, selectedChart]);
    }
  }

  if (loading) return <p className="text-2xl">Loading...</p>;
  if (!labs || !labs.length) return <p className="text-2xl">No labs.</p>;  

  const chartData = selectedChart
    ? labs.filter(lab => lab.test_type === selectedChart).map(lab => ({
        date: moment(lab.test_date).format('YYYY-MM-DD'), // Formatted date for graphing and display
        result: lab.test_result,
        unit: lab.test_unit,
      })).sort((a, b) => a.date.localeCompare(b.date)) // Sort by date
    : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border rounded">
          <p className="label" style={{ color: 'black' }}>{`Date : ${moment(label).format('MM-DD-YY')}`}</p>
          <p className="label" style={{ color: 'black' }}>{`Result : ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
  };
    

  // Calculating min and max for Y-Axis
  let minVal = chartData.length ? Math.min(...chartData.map(data => data.result)) : 0;
  let maxVal = chartData.length ? Math.max(...chartData.map(data => data.result)) : 0;

  const DashboardCharts = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {dashboardCharts.map(chartType => {
          const chartData = labs
            .filter(lab => lab.test_type === chartType)
            .map(lab => ({
              date: moment(lab.test_date).format('YYYY-MM-DD'),
              result: lab.test_result,
              unit: lab.test_unit,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

          let minVal = chartData.length
            ? Math.min(...chartData.map(data => data.result))
            : 0;
          let maxVal = chartData.length
            ? Math.max(...chartData.map(data => data.result))
            : 0;

          return (
            <div key={chartType}>
              <h2 className="text-xl font-semibold tracking-wide text-blue-400">
                {chartType}
              </h2>
              <ResponsiveContainer width="100%" aspect={1}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }}
                    tickFormatter={(date) => moment(date).format('MM-DD-YY')}
                  />
                  <YAxis
                    dataKey="result"
                    label={{ value: 'Result', angle: -90, position: 'insideLeft' }}
                    domain={[minVal, maxVal]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="result" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="font-sans min-h-screen bg-gray-900 py-6 flex flex-col justify-center sm:py-12 text-white">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-2xl text-center font-semibold tracking-wide mt-6 mb-6 text-blue-400">Charts</h1>
        <div className="relative px-4 py-10 bg-gray-800 mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <select
                onChange={handleSelectChart}
                className="w-full p-2 border-2 rounded-lg border-blue-500 bg-gray-700 text-white outline-none"
              >
                <option value="">Select a test</option>
                {uniqueTestTypes.map((type, index) => (
                  <option value={type} key={index}>{type}</option>
                ))}
              </select>
              <button
                onClick={handleAddToDashboard}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Add to Dashboard
              </button>
            </div>

            {selectedChart && (
              <div>
                <h2 className="text-xl font-semibold tracking-wide mt-6 mb-6 text-blue-400">{selectedChart}</h2>
                <ResponsiveContainer width="100%" aspect={1}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }} 
                      tickFormatter={(date) => moment(date).format('MM-DD-YY')} 
                    />
                    <YAxis 
                      dataKey="result" 
                      label={{ value: 'Result', angle: -90, position: 'insideLeft' }} 
                      domain={[minVal, maxVal]} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="result" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
      <DashboardCharts />
    </div>
  )
}
