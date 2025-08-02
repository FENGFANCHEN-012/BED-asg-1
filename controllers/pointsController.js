const Points = require('../models/points_model');

exports.getPoints = async (req, res, next) => {
  try {
    const points = await Points.getPoints(req.user.user_id); // <--- FIXED
    res.json({ points });
  } catch (err) {
    next(err);
  }
};

exports.addPoints = async (req, res, next) => {
  try {
    const { delta } = req.body;
    if (typeof delta !== 'number') {
      return res.status(400).json({ msg: 'body.delta must be a number' });
    }
    await Points.addPoints(req.user.user_id, delta); // <--- FIXED
    res.json({ msg: 'Points updated' });
  } catch (err) {
    next(err);
  }
};
