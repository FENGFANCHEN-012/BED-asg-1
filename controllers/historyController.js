// controllers/historyController.js
const History = require('../models/history_model');

exports.getHistory = async (req, res, next) => {
  try {
    const hist = await History.getHistory(req.user.id);
    res.json({ history: hist });
  } catch (err) {
    next(err);
  }
};

exports.logHistory = async (req, res, next) => {
  try {
    const items = req.body.items;         // array of { voucher_id, title, quantity }
    await require('../models/history_model')
            .logEntries(req.user.id, items);
    res.json({ msg: 'History recorded' });
  } catch(err) {
    next(err);
  }
};

