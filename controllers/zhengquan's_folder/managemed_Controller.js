const medModel = require("./managemed_model");

async function getAllMedications(req, res) {
  try {
    const meds = await medModel.getAllMedications();
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: "Error fetching medications" });
  }
}

async function getMedicationById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const med = await medModel.getMedicationById(id);
    if (!med) return res.status(404).json({ error: "Medication not found" });
    res.json(med);
  } catch (err) {
    res.status(500).json({ error: "Error fetching medication" });
  }
}

async function createMedication(req, res) {
  try {
    const med = await medModel.createMedication(req.body);
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ error: "Error creating medication" });
  }
}

module.exports = {
  getAllMedications,
  getMedicationById,
  createMedication,
};
