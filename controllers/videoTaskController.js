// controllers/videoTaskController.js
const sql    = require('mssql');
const config = require('../dbConfig');
const Tasks  = require('../models/video_task_model');
const Watches= require('../models/video_watch_model');
const Points = require('../models/points_model');

exports.listTasks = async (req, res, next) => {
  try {
    const tasks = await Tasks.getAll();
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// fetch a single video task by ID
exports.getTask = async (req, res, next) => {
  try {
    const taskId = req.params.task_id;
    const task = await Tasks.getById(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

exports.completeTask = async (req, res, next) => {
  const userId = req.user.user_id; // <--- FIXED
  const { task_id } = req.body;
  let pool;

  try {
    // 1) Prevent double‑awarding
    if (await Watches.hasWatched(userId, task_id)) {
      return res.status(400).json({ msg: 'Task already completed' });
    }

    // 2) Begin transaction
    pool = await new sql.ConnectionPool(config).connect();
    const trx = new sql.Transaction(pool);
    await trx.begin();

    // 3) Record the watch
    await Watches.recordWatch(userId, task_id, trx);

    // 4) Award points
    const task = await Tasks.getById(task_id);
    await Points.addPoints(userId, task.point_value);

    // 5) Commit
    await trx.commit();
    res.json({ msg: 'Points awarded', added: task.point_value });
  } catch (err) {
    if (pool) await pool.close().catch(() => {});
    next(err);
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
};

