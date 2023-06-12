const { Configuration, OpenAIApi } = require('openai');
import { supabase } from '../../api';


const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(filteredTests, userProfile) {
  const prompt = `I have the following lab test results: ${filteredTests}. 
  The patient's profile information is as follows: Age: ${userProfile.age}, Sex: ${userProfile.sex}, Ethnicity: ${userProfile.ethnicity}, Location: ${userProfile.location}. 
  As a medical expert, your task is to analyze these lab results in the context of the patient's profile. Specifically, please address the following points: 1. Identify any lab results that appear to be abnormal or concerning. 2. Discuss potential causes or conditions that could explain these abnormal results. 3. Propose your initial plan of action or recommendations as a doctor. This could include further testing, referrals to specialists, or potential treatment options. Remember, your analysis should be based on the information provided, and while you should use your expertise to make informed judgments, you should also consider the limits of the information available.`;
  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1000,
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

async function performAnalysis(filteredTests, id, userProfile) {
  const completion = await getCompletion(filteredTests, userProfile);
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
    const { filteredTests, userId } = req.body;
    try {
      // Fetch the user's profile from the database
      const { data: userProfile, error: userProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (userProfileError) throw userProfileError;
      const id = userProfile.id;

      // Start the analysis
      // Pass the user profile to performAnalysis
      await performAnalysis(filteredTests, id, userProfile);
      
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

