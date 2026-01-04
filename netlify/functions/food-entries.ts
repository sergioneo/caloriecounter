import type { Handler, HandlerEvent } from '@netlify/functions';
import { getDb, getStorageService } from './src/utils/firebase';
import { getAuthService } from './src/utils/firebase';

async function verifyAuth(event: HandlerEvent): Promise<string | null> {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const auth = getAuthService();
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  const userId = await verifyAuth(event);
  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const db = getDb();
  const path = event.path.replace('/.netlify/functions/food-entries', '');
  const pathParts = path.split('/').filter(Boolean);

  try {
    // GET /food-entries/daily/:date
    if (event.httpMethod === 'GET' && pathParts[0] === 'daily' && pathParts[1]) {
      const date = pathParts[1];
      const entriesSnapshot = await db
        .collection('foodEntries')
        .where('userId', '==', userId)
        .where('date', '==', date)
        .orderBy('createdAt')
        .get();

      const entries = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const totalNutrition = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        cholesterol: 0,
        saturatedFat: 0,
        transFat: 0,
      };

      entries.forEach((entry: any) => {
        entry.foods?.forEach((food: any) => {
          totalNutrition.calories += food.nutrition.calories || 0;
          totalNutrition.protein += food.nutrition.protein || 0;
          totalNutrition.carbohydrates += food.nutrition.carbohydrates || 0;
          totalNutrition.fat += food.nutrition.fat || 0;
          totalNutrition.fiber += food.nutrition.fiber || 0;
          totalNutrition.sugar += food.nutrition.sugar || 0;
          totalNutrition.sodium += food.nutrition.sodium || 0;
          totalNutrition.cholesterol += food.nutrition.cholesterol || 0;
          totalNutrition.saturatedFat += food.nutrition.saturatedFat || 0;
          totalNutrition.transFat += food.nutrition.transFat || 0;
        });
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          date,
          totalNutrition,
          entries,
        }),
      };
    }

    // GET /food-entries/history?startDate=...&endDate=...
    if (event.httpMethod === 'GET' && pathParts[0] === 'history') {
      const startDate = event.queryStringParameters?.startDate;
      const endDate = event.queryStringParameters?.endDate;

      if (!startDate || !endDate) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Start date and end date are required' }),
        };
      }

      const entriesSnapshot = await db
        .collection('foodEntries')
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'desc')
        .orderBy('createdAt', 'desc')
        .get();

      const entries = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return {
        statusCode: 200,
        body: JSON.stringify(entries),
      };
    }

    // POST /food-entries - Create entry
    if (event.httpMethod === 'POST' && pathParts.length === 0) {
      const { date, mealType, foods, imageUrl, notes } = JSON.parse(event.body || '{}');

      if (!date || !mealType || !foods) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Date, mealType, and foods are required' }),
        };
      }

      const entryData = {
        userId,
        date,
        mealType,
        foods,
        imageUrl: imageUrl || null,
        notes: notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await db.collection('foodEntries').add(entryData);
      const doc = await docRef.get();

      return {
        statusCode: 201,
        body: JSON.stringify({
          id: doc.id,
          ...doc.data(),
        }),
      };
    }

    // PUT /food-entries/:id - Update entry
    if (event.httpMethod === 'PUT' && pathParts.length === 1) {
      const entryId = pathParts[0];
      const { foods } = JSON.parse(event.body || '{}');

      if (!foods) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Foods are required' }),
        };
      }

      const docRef = db.collection('foodEntries').doc(entryId);
      const doc = await docRef.get();

      if (!doc.exists || doc.data()?.userId !== userId) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Entry not found' }),
        };
      }

      await docRef.update({
        foods,
        updatedAt: new Date().toISOString(),
      });

      const updated = await docRef.get();
      return {
        statusCode: 200,
        body: JSON.stringify({
          id: updated.id,
          ...updated.data(),
        }),
      };
    }

    // DELETE /food-entries/:id - Delete entry
    if (event.httpMethod === 'DELETE' && pathParts.length === 1) {
      const entryId = pathParts[0];
      const docRef = db.collection('foodEntries').doc(entryId);
      const doc = await docRef.get();

      if (!doc.exists || doc.data()?.userId !== userId) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Entry not found' }),
        };
      }

      await docRef.delete();
      return {
        statusCode: 204,
        body: '',
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };
  } catch (error) {
    console.error('Food entries error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
