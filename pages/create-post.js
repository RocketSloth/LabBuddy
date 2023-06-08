import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useRouter } from 'next/router';
import { supabase } from '../api';

function CreatePost() {
  const [post, setPost] = useState({ test_type: '', test_result: '', test_date: '', test_unit: '' });
  const [testTypes, setTestTypes] = useState([]);
  const [testUnits, setTestUnits] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchStandardLabInfo();
  }, []);

  async function fetchStandardLabInfo() {
    try {
      const { data, error } = await supabase
        .from('standard_lab_info')
        .select('standard_test, standard_unit');

      if (error) {
        console.error('Error fetching standard lab info:', error);
      } else {
        const rows = data.map(row => ({
          test: row.standard_test,
          unit: row.standard_unit
        }));
        setTestTypes(rows.map(row => row.test));
        setTestUnits(rows);
      }
    } catch (error) {
      console.error('Error fetching standard lab info:', error);
    }
  }

  function onChange(e) {
    const { name, value } = e.target;
    setPost(prevPost => ({ ...prevPost, [name]: value }));

    if (name === 'test_type') {
      const selectedTest = value;
      const selectedTestUnit = testUnits.find(unit => unit.test === selectedTest);
      const unitValue = selectedTestUnit ? selectedTestUnit.unit : '';
      setPost(prevPost => ({ ...prevPost, test_unit: unitValue }));
    }
  }
  
  async function createNewPost() {
    if (!post.test_type || !post.test_result || !post.test_date || !post.test_unit) return;
    const user = supabase.auth.user();
    const { data, error } = await supabase
    .from('labs')
    .insert([{ 
      test_type: post.test_type, 
      test_result: post.test_result, 
      test_date: post.test_date, 
      test_unit: post.test_unit, 
      user_id: user.id, 
      user_email: user.email 
    }]).single();

    if (error) console.error('Error inserting new post: ', error);
    else router.push(`/posts/${data.id}`);
  }

  return (
    <div className="max-w-lg mx-auto my-10 p-10 rounded-lg shadow-md bg-gray-900 text-white">
      <h1 className="text-3xl font-semibold tracking-wide mt-6 text-center">Submit Lab Result</h1>
      
      <form className="mt-6">
        <div className="mb-4">
          <label className="block mb-2 font-semibold" htmlFor="test_type">Test Type</label>
          <input
            list="test-types"
            id="test_type"
            name="test_type"
            value={post.test_type}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 bg-gray-800 text-white"
          />
          <datalist id="test-types">
            {testTypes.map((type, index) => (
              <option value={type} key={index}>{type}</option>
            ))}
          </datalist>
        </div>


        <div className="mb-4">
          <label className="block mb-2 font-semibold" htmlFor="test_date">Test Date</label>
          <input
            id="test_date"
            type="date"
            name="test_date"
            value={post.test_date}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold" htmlFor="test_result">Test Result</label>
          <input
            id="test_result"
            type="text"
            name="test_result"
            value={post.test_result}
            onChange={onChange}
            placeholder="Test Result"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 bg-gray-800 text-white"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold" htmlFor="test_unit">Unit of Measurement</label>
          <select
            id="test_unit"
            name="test_unit"
            value={post.test_unit}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-500 bg-gray-800 text-white"
          >
            <option value="">-- Please choose a unit of measurement --</option>
            {testUnits.map((unit, index) => (
              <option value={unit.unit} key={index}>{unit.unit}</option>
            ))}
          </select>
        </div>
    
        <div className="mt-6">
          <button
            type="button"
            className="w-full px-3 py-4 text-white bg-green-500 hover:bg-green-600 rounded-md focus:bg-green-600 focus:outline-none"
            onClick={createNewPost}
          >
            Log Labs
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatePost;
