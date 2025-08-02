// controllers/cartController.js
const sql     = require('mssql');
const config  = require('../dbConfig');
const Cart    = require('../models/cart_model');
const Points  = require('../models/points_model');
const History = require('../models/history_model');

exports.viewCart = async (req, res, next) => {
  try {
    const cart = await Cart.getCart(req.user.id);
    res.json({ cart });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { voucher_id, quantity } = req.body;
    await Cart.addItem(req.user.id, voucher_id, quantity || 1);
    res.status(201).json({ msg: 'Added to cart' });
  } catch (err) {
    next(err);
  }
};

exports.editCart = async (req, res, next) => {
  try {
    const { cart_id } = req.params;
    const { quantity } = req.body;
    await Cart.updateItem(cart_id, quantity);
    res.json({ msg: 'Cart updated' });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    await Cart.removeItem(req.params.cart_id);
    res.json({ msg: 'Removed from cart' });
  } catch (err) {
    next(err);
  }
};

exports.checkout = async (req, res, next) => {
  let pool;
  try {
    console.log('🔄 Starting checkout for user', req.user.id);
    pool = await new sql.ConnectionPool(config).connect();
    console.log('✔️  Connected to DB, beginning transaction');
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    console.log('📦  Fetching cart items…');
    const cart = await Cart.getCart(req.user.id);
    console.log('📦  Cart contents:', cart);

    const totalCost = cart.reduce((sum, i) => sum + i.cost_points * i.quantity, 0);
    console.log(`💰  Total cost calculated: ${totalCost}`);

    console.log('➖ Deducting points…');
    await Points.deductPoints(req.user.id, totalCost, transaction);
    console.log('➖ Points deducted');

    console.log('➕ Inserting redeemed vouchers…');
    for (let item of cart) {
      console.log('   • inserting voucher', item.voucher_id, 'qty', item.quantity);
      const insertReq = transaction.request();
      await insertReq
        .input('user_id',    sql.Int, req.user.id)
        .input('voucher_id', sql.Int, item.voucher_id)
        .input('qty',        sql.Int, item.quantity)
        .query(`
          INSERT INTO user_vouchers(user_id, voucher_id, quantity)
          VALUES(@user_id, @voucher_id, @qty)
        `);
    }

    console.log('📝 Logging history entries…');
    for (let item of cart) {
      console.log('   • history entry', item.voucher_id, 'qty', item.quantity);
      const histReq = transaction.request();
      await histReq
        .input('user_id',       sql.Int,           req.user.id)
        .input('voucher_id',    sql.Int,           item.voucher_id)
        .input('voucher_title', sql.NVarChar(100), item.title)
        .input('quantity',      sql.Int,           item.quantity)
        .query(`
          INSERT INTO user_voucher_history
            (user_id, voucher_id, voucher_title, quantity)
          VALUES
            (@user_id, @voucher_id, @voucher_title, @quantity)
        `);
    }
    console.log('📝 History logged');

    console.log('🧹 Clearing cart…');
    await Cart.clearCart(req.user.id, transaction);
    console.log('🧹 Cart cleared');

    await transaction.commit();
    console.log('✅ Transaction committed successfully');
    res.json({ msg: 'Checkout successful', totalCost });
  } catch (err) {
    console.error('❌ Error during checkout:', err);
    // No partial state left—rollback happens implicitly on error
    next(err);
  } finally {
    if (pool) await pool.close().catch(() => {});
  }
};
