const { Configuration, OpenAIApi } = require('openai');
import { supabase } from '../../api';


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(filteredTests) {
  const prompt = `I have the following lab test results: ${filteredTests}. Act as a doctor and provide analysis and recommendations based on the given blood test results. analyze all the lab results and provide me with an interpretation of what all the lab results mean as well as any concerning trends or potentially dangerous results. Then make some recommendations on how I can change the trending patterns for the better. Also, if any potentially dangerous levels or trends are detected, provide me with some instructions on how I can talk to my doctor about my concerns.`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 250,
      top_p: 0.1,
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
  const aiResponse = completion.data.choices[0].text.trim();

  // Save the result to the database
  await supabase
    .from('analyses')
    .update({ result: aiResponse })
    .eq('id', id);
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const filteredTests = req.body.filteredTests;
    const userId = req.body.userId;  // Get the user's ID from the request body
    try {
      // Create a new analysis record and get its ID
      const { data, error } = await supabase
        .from('analyses')
        .insert({ status: 'processing', user_id: userId });  // Include the user's ID in the new analysis record
      if (error) throw error;
      const id = data[0].id;

      // Start the analysis
      performAnalysis(filteredTests, id);

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

