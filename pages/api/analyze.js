const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getCompletion(filteredTests) {
  const prompt = `I have the following lab test results: ${filteredTests}. Act as a doctor and provide analysis and recommendations based on the given blood test results. analyze all the lab results and provide me with a summary and interpretation of what all the lab results mean as well as any concerning trends or potentially dangerous results. Then make some recommendations on how I can change the trending patterns for the better. Also, if any potentially dangerous levels or trends are detected, provide me with some instructions on how I can talk to my doctor about my concerns.`;

  try {
    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 1000,
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

async function performAnalysis(filteredTests) {
  const completion = await getCompletion(filteredTests);
  const aiResponse = completion.data.choices[0].text.trim();

  return aiResponse;
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const filteredTests = req.body.filteredTests;
    try {
      const analysis = await performAnalysis(filteredTests);
      res.status(200).json({ analysis });
    } catch (err) {
      console.error('Error analyzing test results:', err);
      res.status(500).json({ error: 'Error analyzing test results' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
