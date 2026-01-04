import type { Handler, HandlerEvent } from '@netlify/functions';
import { parseManualEntry } from './src/services/claudeService';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { prompt, foodItem } = JSON.parse(event.body || '{}');

    if (!prompt && !foodItem) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Either prompt or foodItem is required' }),
      };
    }

    if (foodItem) {
      return {
        statusCode: 200,
        body: JSON.stringify({ foods: [foodItem] }),
      };
    }

    if (prompt) {
      const foods = await parseManualEntry(prompt);
      return {
        statusCode: 200,
        body: JSON.stringify({ foods }),
      };
    }
  } catch (error) {
    console.error('Manual entry error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process manual entry' }),
    };
  }
};
