import type { Handler, HandlerEvent } from '@netlify/functions';
import { analyzeFoodImage } from './src/services/claudeService';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { image, mealType } = JSON.parse(event.body || '{}');

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Image is required' }),
      };
    }

    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
    const result = await analyzeFoodImage(base64Image, mealType);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze image' }),
    };
  }
};
