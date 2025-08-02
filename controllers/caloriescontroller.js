const caloriesModel = require('../models/caloriesmodel.js'); // Updated import

/**
 * Get total calories for graph (with recommended calories).
 * Query param: ?user_id=1
 */
async function getGraphData(req, res) {
  const userId = parseInt(req.query.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid user_id.' });
  }

  try {
    const todayCaloriesResult = await caloriesModel.getTodayCalories(userId);
    const totalCalories = todayCaloriesResult?.total_calories || 0;

    const age = await caloriesModel.getUserAge(userId);
    if (!age) {
      return res.status(404).json({ error: 'User profile not found, cannot determine recommended calories.' });
    }

    const recommended = await caloriesModel.getRecommendedCaloriesByAge(age);

    res.status(200).json({ totalCalories, recommended });
  } catch (error) {
    console.error('Controller error fetching graph data:', error);
    res.status(500).json({ error: 'Internal server error fetching graph data.' });
  }
}

/**
 * Get today's calorie intake history.
 * Query param: ?user_id=1
 */
async function getHistory(req, res) {
  const userId = parseInt(req.query.user_id);

  if (isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid user_id.' });
  }

  try {
    const result = await caloriesModel.getDailyHistory(userId);

    const formattedResult = result.map(item => {
      let formattedTime = '00:00';
      if (item.time instanceof Date) {
        formattedTime = item.time.toISOString().substring(11, 16);
      } else if (typeof item.time === 'string' && item.time.length >= 5) {
        formattedTime = item.time.substring(0, 5);
      }
      return { ...item, time: formattedTime };
    });

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Controller error fetching history:', error);
    res.status(500).json({ error: 'Internal server error fetching history.' });
  }
}

/**
 * Search food items.
 * Query param: ?q=food_name
 */
async function searchFood(req, res) {
  const q = req.query.q;

  if (!q || q.trim() === '') {
    return res.status(200).json([]);
  }

  try {
    const foodItems = await caloriesModel.searchFoodItems(q.trim());
    res.status(200).json(foodItems);
  } catch (error) {
    console.error('Controller error searching food:', error);
    res.status(500).json({ error: 'Internal server error searching food.' });
  }
}

/**
 * Add food entry.
 * Body: { user_id, meal_type, food_id, quantity, time }
 */
async function addFoodEntry(req, res) {
  const { user_id, meal_type, food_id, quantity, time } = req.body;

  if (!user_id || !meal_type || !food_id || quantity === undefined || time === undefined) {
    return res.status(400).json({ error: 'Missing required fields: user_id, meal_type, food_id, quantity, time.' });
  }

  if (typeof user_id !== 'number' || user_id <= 0) {
    return res.status(400).json({ error: 'Invalid user_id. Must be a positive number.' });
  }
  if (typeof meal_type !== 'string' || meal_type.trim() === '') {
    return res.status(400).json({ error: 'Invalid meal_type. Must be a non-empty string.' });
  }
  if (typeof food_id !== 'number' || food_id <= 0) {
    return res.status(400).json({ error: 'Invalid food_id. Must be a positive number.' });
  }
  if (typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid quantity. Must be a positive number.' });
  }
  if (typeof time !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return res.status(400).json({ error: 'Invalid time format. Must be HH:mm or HH:mm:ss.' });
  }

  try {
    const caloriesPerUnit = await caloriesModel.getCaloriesPerUnit(food_id);
    if (caloriesPerUnit === null) {
      return res.status(404).json({ error: 'Food item not found.' });
    }

    const total_calories = caloriesPerUnit * quantity;
    const formattedTime = time.length === 5 ? `${time}:00` : time;

    const entryData = { user_id, meal_type, food_id, quantity, total_calories, time: formattedTime };
    const success = await caloriesModel.addFoodEntry(entryData);

    if (success) {
      res.status(201).json({ message: 'Food entry added successfully!' });
    } else {
      res.status(500).json({ error: 'Failed to add food entry.' });
    }
  } catch (error) {
    console.error('Controller error adding food entry:', error);
    res.status(500).json({ error: 'Internal server error adding food entry.' });
  }
}

/**
 * Delete food entry by ID.
 * Route param: /api/food/delete/:id
 */
async function deleteFoodEntry(req, res) {
  const entryId = parseInt(req.params.id);

  if (isNaN(entryId) || entryId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid entry ID.' });
  }

  try {
    const success = await caloriesModel.deleteEntry(entryId);
    if (success) {
      res.status(200).json({ message: 'Food entry deleted successfully!' });
    } else {
      res.status(404).json({ error: 'Food entry not found or already deleted.' });
    }
  } catch (error) {
    console.error('Controller error deleting food entry:', error);
    res.status(500).json({ error: 'Internal server error deleting food entry.' });
  }
}

/**
 * Update meal time.
 * Route param: /api/food/update-time/:id
 * Body: { time }
 */
async function updateMealTime(req, res) {
  const entryId = parseInt(req.params.id);
  const { time } = req.body;

  if (isNaN(entryId) || entryId <= 0) {
    return res.status(400).json({ error: 'Missing or invalid entry ID.' });
  }
  if (typeof time !== 'string' || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return res.status(400).json({ error: 'Invalid time format. Must be HH:mm or HH:mm:ss.' });
  }

  try {
    const formattedTime = time.length === 5 ? `${time}:00` : time;
    const success = await caloriesModel.updateEntryTime(entryId, formattedTime);

    if (success) {
      res.status(200).json({ message: 'Meal time updated successfully!' });
    } else {
      res.status(404).json({ error: 'Food entry not found or time not updated.' });
    }
  } catch (error) {
    console.error('Controller error updating meal time:', error);
    res.status(500).json({ error: 'Internal server error updating meal time.' });
  }
}

/**
 * Get food recommendations.
 * Query param: ?max=calories
 */
async function getRecommendedFoods(req, res) {
  const maxCalories = parseInt(req.query.max);

  if (isNaN(maxCalories) || maxCalories <= 0) {
    return res.status(400).json({ error: 'Invalid max calories. Must be a positive number.' });
  }

  try {
    const recommendedFoods = await caloriesModel.getRecommendedFood(maxCalories);
    res.status(200).json(recommendedFoods);
  } catch (error) {
    console.error('Controller error fetching food recommendations:', error);
    res.status(500).json({ error: 'Internal server error fetching food recommendations.' });
  }
}

module.exports = {
  getGraphData,
  getHistory,
  searchFood,
  addFoodEntry,
  deleteFoodEntry,
  updateMealTime,
  getRecommendedFoods
};
