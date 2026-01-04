import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  confirmed: boolean;
  nutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    saturatedFat?: number;
    transFat?: number;
  };
}

export interface ClarificationQuestion {
  id: string;
  foodId: string;
  question: string;
  options?: string[];
  type: 'size' | 'portion' | 'identification' | 'preparation';
}

export interface FoodRecognitionResponse {
  foods: FoodItem[];
  clarificationNeeded?: ClarificationQuestion[];
  confidence: 'high' | 'medium' | 'low';
}

export async function analyzeFoodImage(
  imageBase64: string,
  mealType?: string
): Promise<FoodRecognitionResponse> {
  try {
    let prompt = `You are a nutrition expert AI. Analyze this food image and provide detailed nutritional information.

${mealType ? `This appears to be a ${mealType} meal.` : ''}

Please identify all visible food items and estimate their nutritional content. For each food item, provide:
1. Name of the food
2. Estimated quantity/serving size
3. Unit of measurement
4. Complete nutritional information (calories, protein, carbs, fat, fiber, sugar, sodium, cholesterol, saturated fat, trans fat)

Important guidelines:
- Be as accurate as possible based on visual cues
- If portion sizes are unclear, ask clarifying questions
- If you're uncertain about a food item's identity, ask for confirmation
- Provide nutritional values per serving
- Round values to 1 decimal place

Return your response in the following JSON format:
{
  "confidence": "high" | "medium" | "low",
  "foods": [
    {
      "id": "unique-id",
      "name": "food name",
      "quantity": number,
      "unit": "g/oz/cup/piece/etc",
      "confirmed": false,
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbohydrates": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number,
        "cholesterol": number,
        "saturatedFat": number,
        "transFat": number
      }
    }
  ],
  "clarificationNeeded": [
    {
      "id": "question-id",
      "foodId": "food-id",
      "question": "What size is the portion?",
      "type": "size" | "portion" | "identification" | "preparation",
      "options": ["small", "medium", "large"]
    }
  ]
}

Only include "clarificationNeeded" if you need more information to provide accurate nutritional data.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Claude response');
    }

    const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    result.foods = result.foods.map((food: any, idx: number) => ({
      ...food,
      id: food.id || `food-${Date.now()}-${idx}`,
      confirmed: false,
    }));

    if (result.clarificationNeeded) {
      result.clarificationNeeded = result.clarificationNeeded.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `question-${Date.now()}-${idx}`,
      }));
    }

    return result;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw new Error('Failed to analyze food image');
  }
}

export async function parseManualEntry(prompt: string): Promise<FoodItem[]> {
  try {
    const systemPrompt = `You are a nutrition expert AI. The user will describe a food or meal they ate. Parse this description and provide detailed nutritional information.

Return your response in the following JSON format:
{
  "foods": [
    {
      "id": "unique-id",
      "name": "food name",
      "quantity": number,
      "unit": "g/oz/cup/piece/etc",
      "confirmed": true,
      "nutrition": {
        "calories": number,
        "protein": number,
        "carbohydrates": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number,
        "cholesterol": number,
        "saturatedFat": number,
        "transFat": number
      }
    }
  ]
}

If the user's description is vague or missing information, make reasonable assumptions based on typical serving sizes.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Claude response');
    }

    const result = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    result.foods = result.foods.map((food: any, idx: number) => ({
      ...food,
      id: food.id || `food-${Date.now()}-${idx}`,
    }));

    return result.foods;
  } catch (error) {
    console.error('Error parsing manual entry:', error);
    throw new Error('Failed to parse food description');
  }
}
