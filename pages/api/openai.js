// 'openai.js'

import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { model, messages } = req.body;

  try {
    const completion = await openai.createChatCompletion({
      model,
      messages,
    });

    res.status(200).json(completion.data);
  } catch (error) {
    console.error('OpenAI API request failed:', error);
    res.status(500).json({ error: 'Failed to fetch data from OpenAI API' });
  }
}
