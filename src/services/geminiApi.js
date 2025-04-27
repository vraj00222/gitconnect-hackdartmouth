const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
// Make sure it's there or imported!

export async function getGeminiSummary(text) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text },
              ],
            },
          ],
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Error ${response.status}: ${errorData.error.message}`);
      }
  
      const data = await response.json();
      const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
      return output || 'No summary generated.';
    } catch (error) {
      if (error.message.includes('429')) {
        console.error('Quota exceeded. Please wait or upgrade your Gemini API plan.');
        return 'Quota exceeded. Please try again later.';
      } else {
        console.error('Error fetching Gemini summary:', error);
        throw error;
      }
    }
  }
  
