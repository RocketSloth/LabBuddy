// 'retrieveAnalysis.js'

import { supabase } from '../../api';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data: analysis, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false }) // Adjust this line to use the timestamp column name
        .limit(1)
        .single();
      if (analysisError) throw analysisError;

      res.status(200).json(analysis);
    } catch (err) {
      console.error('Error retrieving analysis:', err);
      res.status(500).json({ error: 'Error retrieving analysis' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
