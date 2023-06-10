const { Configuration, OpenAIApi } = require('openai');
import { supabase } from '../../api';


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(filteredTests) {
  const prompt = `I have the following lab test results: ${filteredTests}. Act as a Doctor and analyze the lab results. Let me know if any of the labs look concerning, what could be causing the concerning results, and what you as a doctor would do about it.`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 250,
      top_p: 0.5,
    });
    console.log(completion.data.choices[0].text);
    return completion;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

async function performAnalysis(filteredTests, id) {
  const completion = await getCompletion(filteredTests);
  if (!completion || !completion.data || !completion.data.choices || !completion.data.choices[0] || !completion.data.choices[0].text) {
    console.error('Error in getCompletion:', completion);
    // Handle the error here...
    return;
  }
  const aiResponse = completion.data.choices[0].text.trim();

  // Save the result to the database
  await supabase
    .from('analyses')
    .update({ result: aiResponse, status: 'complete' })  // Update status to 'complete'
    .eq('id', id);
}


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { filteredTests, userId } = req.body;  // Add userId here
    try {
      // Create a new analysis record and get its ID
      const { data, error } = await supabase
        .from('analyses')
        .insert({ status: 'processing', user_id: userId });  // Save the user_id with the analysis
      if (error) throw error;
      const id = data[0].id;

      // Start the analysis
      await performAnalysis(filteredTests, id);

      // Respond with the ID
      res.status(200).json({ id });
    } catch (err) {
      console.error('Error starting analysis:', err);
      res.status(500).json({ error: 'Error starting analysis' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}

