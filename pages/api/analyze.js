// 'analyze.js'

const { Configuration, OpenAIApi } = require('openai');
import { supabase } from '../../api';


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(filteredTests, userProfile, followUpQuestion = '') {
  const initialPrompt = followUpQuestion 
    ? followUpQuestion 
    : `I have the following lab test results: ${filteredTests}. The patient's profile information is as follows: Age: ${userProfile.age}, Sex: ${userProfile.sex}, Ethnicity: ${userProfile.ethnicity}, Location: ${userProfile.location}. Please provide an analysis.`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: initialPrompt,
      max_tokens: 250,
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


async function performAnalysis(filteredTests, id, userProfile, userId) {
  const completion = await getCompletion(filteredTests, userProfile);
  if (!completion || !completion.data || !completion.data.choices || !completion.data.choices[0] || !completion.data.choices[0].text) {
    console.error('Error in getCompletion:', completion);
    return;
  }
  const aiResponse = completion.data.choices[0].text.trim();

  // Save the result to the database  
  const { data, error } = await supabase
    .from('analyses')
    .insert([
      { result: aiResponse, status: 'complete', user_id: userId },
    ])
    if (error) {
      console.error('Error saving analysis result:', error);
      return;
    }
    return data.id;  // Return the id of the new analysis
}



export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { filteredTests, userId, followUpQuestion } = req.body;
    try {
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (userProfileError) throw userProfileError;
      const id = userProfile.id;

      await performAnalysis(filteredTests, id, userProfile, userId, followUpQuestion);
      
      res.status(200).json({ id });
    } catch (err) {
      console.error('Error starting analysis:', err);
      res.status(500).json({ error: 'Error starting analysis' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}


