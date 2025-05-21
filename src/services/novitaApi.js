const NOVITA_API_KEY = import.meta.env.VITE_NOVITA_API_KEY;

export async function getNovitaSummary(userPrompt) {
  try {
    const response = await fetch('https://api.novita.ai/v3/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOVITA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct',  // You can change this model ID if needed
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes GitHub profiles in a professional and concise manner.',
          },
          {
            role: 'user',
            content: userPrompt,
          }
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Novita API error:', errorData);
      throw new Error(`Error ${response.status}: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'No summary generated.';
  } catch (error) {
    console.error('Error fetching Novita summary:', error);
    return 'An error occurred while generating summary.';
  }
}
