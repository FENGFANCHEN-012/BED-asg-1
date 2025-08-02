const model = require("../models/managemed_model");


async function getAllMedications(req, res) {
  try {
    const meds = await model.getAllMedications();
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch medications" });
  }
}

async function getMedicationById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const med = await model.getMedicationById(id);
  if (med) {
    res.json(med);
  } else {
    res.status(404).json({ error: "Medication not found" });
  }
}

async function createMedication(req, res) {
  try {
    const med = await model.createMedication(req.body);
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ error: "Failed to create medication" });
  }
}

async function deleteMedicationById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  const result = await model.deleteMedicationById(id);
  if (result) {
    res.json({ message: `Medication ID ${id} deleted.` });
  } else {
    res.status(404).json({ error: "Medication not found" });
  }
}


async function getMedicationHistory(req, res) {
  try {
    const history = await model.getMedicationHistory();
    res.json(history);
  } catch (err) {
    console.error("Error fetching medication history:", err);
    res.status(500).json({ error: "Failed to fetch medication history" });
  }
}

async function logMedicationTaken(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const result = await model.logMedicationTaken(id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to log medication" });
  }
}


async function markAsTaken(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid medication ID" });
  }

  try {
    await model.markMedicationAsTaken(id);
    res.status(200).json({ message: "Marked as taken" });
  } catch (err) {
    console.error("Error marking as taken:", err);
    res.status(500).json({ error: "Failed to mark medication" });
  }
}


async function updateMedicationById(req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

  try {
    const updated = await model.updateMedicationById(id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating:", err);
    res.status(500).json({ error: "Update failed" });
  }
}

async function deleteMedicationById(id) {
  const conn = await sql.connect(dbConfig);

  // First delete history logs
  await conn.request()
    .input("id", sql.Int, id)
    .query("DELETE FROM MedicationHistory WHERE medication_id = @id");

  // Then delete medication
  const result = await conn.request()
    .input("id", sql.Int, id)
    .query("DELETE FROM Medications WHERE medication_id = @id");

  return result.rowsAffected[0] > 0;
}




module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
  deleteMedicationById,
  getMedicationHistory,
  logMedicationTaken,
  markAsTaken,
  updateMedicationById
};




