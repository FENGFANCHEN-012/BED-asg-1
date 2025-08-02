const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllMedications() {
  const conn = await sql.connect(dbConfig);
  const result = await conn.request().query("SELECT * FROM Medications");
  return result.recordset;
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
  .input("time", sql.VarChar, data.time)
  .input("start_date", sql.Date, data.start_date)
  .input("end_date", sql.Date, data.end_date);

const result = await request.query(`
  INSERT INTO Medications (user_id, name, dosage, instructions, time, start_date, end_date)
  VALUES (@user_id, @name, @dosage, @instructions, @time, @start_date, @end_date);
  SELECT SCOPE_IDENTITY() AS medication_id;
`);


  return await getMedicationById(result.recordset[0].medication_id);
}

async function deleteMedicationById(id) {
  const conn = await sql.connect(dbConfig);

  // Step 1: Delete from MedicationHistory first
  await conn.request()
    .input("id", sql.Int, id)
    .query("DELETE FROM MedicationHistory WHERE medication_id = @id");

  // Step 2: Delete from Medications
  const result = await conn.request()
    .input("id", sql.Int, id)
    .query("DELETE FROM Medications WHERE medication_id = @id");

  return result.rowsAffected[0] > 0;
}



async function getMedicationHistory() {
  const conn = await sql.connect(dbConfig);
  const result = await conn.request().query(`
    SELECT h.history_id, h.taken_at, m.name, m.dosage
    FROM MedicationHistory h
    JOIN Medications m ON h.medication_id = m.medication_id
    ORDER BY h.taken_at DESC
  `);
  return result.recordset;
}

async function logMedicationTaken(medication_id) {
  const conn = await sql.connect(dbConfig);
  const request = conn.request()
    .input("medication_id", sql.Int, medication_id)
    .input("taken_at", sql.DateTime, new Date());

  await request.query(`
    INSERT INTO MedicationHistory (medication_id, taken_at)
    VALUES (@medication_id, @taken_at)
  `);

  return { message: "Medication logged." };
}

async function markMedicationAsTaken(medicationId) {
  const conn = await sql.connect(dbConfig);
  const request = conn.request()
    .input("medication_id", sql.Int, medicationId)
    .input("taken_at", sql.DateTime, new Date());

  await request.query(`
    INSERT INTO MedicationHistory (medication_id, taken_at)
    VALUES (@medication_id, @taken_at)
  `);
}


module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  deleteMedicationById,
  getMedicationHistory,
  logMedicationTaken,
  markMedicationAsTaken
};




