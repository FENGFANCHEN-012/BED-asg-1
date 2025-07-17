const sql = require("mssql");
const dbConfig = require("./db_config");

async function getAllMedications() {
  try {
    const conn = await sql.connect(dbConfig);
    const result = await conn.request().query("SELECT * FROM Medications");
    return result.recordset;
  } catch (err) {
    console.error("getAllMedications DB error:", err);  // <== ADD THIS
    throw err;
  }
}

async function getMedicationById(id) {
  const conn = await sql.connect(dbConfig);
  const request = conn.request().input("id", sql.Int, id);
  const result = await request.query("SELECT * FROM Medications WHERE medication_id = @id");
  return result.recordset[0] || null;
}

async function createMedication(data) {
  const conn = await sql.connect(dbConfig);
  const request = conn.request()
    .input("user_id", sql.Int, data.user_id)
    .input("name", sql.NVarChar, data.name)
    .input("dosage", sql.NVarChar, data.dosage)
    .input("instructions", sql.NVarChar, data.instructions)
    .input("frequency", sql.NVarChar, data.frequency)
    .input("start_date", sql.Date, data.start_date)
    .input("end_date", sql.Date, data.end_date);

  const result = await request.query(`
    INSERT INTO Medications (user_id, name, dosage, instructions, frequency, start_date, end_date)
    VALUES (@user_id, @name, @dosage, @instructions, @frequency, @start_date, @end_date);
    SELECT SCOPE_IDENTITY() AS medication_id;
  `);

  return await getMedicationById(result.recordset[0].medication_id);
}

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
};
