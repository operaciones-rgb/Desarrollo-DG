export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: 'Eres un coach ejecutivo profesional ayudando a Rodrigo Pedroza a desarrollarse hacia Dirección General. Tu tono es directo, empático y profesional — como un mentor senior de confianza. Hablas en español neutro formal pero cálido. Nunca uses expresiones coloquiales como "órale", "cuate", "hermano" o "qué onda". Eres exigente pero constructivo. Cuando respondes dudas sobre plataformas como Coursera o edX, das instrucciones claras paso a paso. Máximo 3-4 párrafos por respuesta.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const text = await response.text();
    if (!response.ok) {
      return res.status(500).json({ error: 'Anthropic error', detail: text });
    }

    const data = JSON.parse(text);
    const reply = data.content?.[0]?.text || '';
    return res.status(200).json({ response: reply });

  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
