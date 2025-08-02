const API_URL = "http://localhost:3000/medications";

document.addEventListener("DOMContentLoaded", () => {
  fetchMedications();
  document.getElementById("medForm").addEventListener("submit", handleSubmit);
});

async function fetchMedications() {
  try {
    const response = await fetch(API_URL);
    const meds = await response.json();
    renderMedications(meds);
  } catch (err) {
    console.error("Error fetching medications:", err);
    showError("Failed to load medications.");
    document.getElementById("medList").innerHTML = "<p>Failed to load medications.</p>";
  }
}

function renderMedications(meds) {
  const list = document.getElementById("medList");
  list.innerHTML = "";

  meds.forEach(med => {
    const item = document.createElement("div");
    item.className = "med-item";
    item.innerHTML = `
      <div>
        <strong>${med.name} (${med.dosage})</strong><br>
        <small>${med.time} — ${med.instructions || "No notes"}</small>
      </div>
      <button class="button" data-id="${med.medication_id}">Mark as Taken</button>
    `;

    list.appendChild(item);
  });

  // ✅ Attach event listeners AFTER rendering
  document.querySelectorAll(".button").forEach(button => {
    button.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      if (id) {
        try {
          const res = await fetch(`http://localhost:3000/medications/${id}/mark`, {
            method: "POST"
          });
          if (res.ok) {
            showSuccess("Medication marked as taken.");
            fetchMedications(); // refresh list
          } else {
            showError("Failed to mark medication.");
          }
        } catch (err) {
          console.error("Error marking as taken:", err);
          showError("Request failed.");
        }
      }
    });
  });
}



async function handleSubmit(event) {
  event.preventDefault();
  const data = {
    user_id: 1,
    name: document.getElementById("name").value,
    dosage: document.getElementById("dosage").value,
    instructions: document.getElementById("instructions").value,
    time: document.getElementById("time").value, 
    start_date: document.getElementById("start_date").value,
    end_date: document.getElementById("end_date").value || null
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      showSuccess("Medication added successfully!");
      document.getElementById("medForm").reset();
      fetchMedications();
    } else {
      const result = await response.json();
      showError(result.error || "Failed to add medication.");
    }
  } catch (err) {
    console.error("Submit error:", err);
    showError("Request failed.");
  }
}

function injectAlertStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .alert-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999;
    }
    .alert-box {
      background-color: #ffffff;
      padding: 50px 60px;
      border-radius: 25px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.5);
      width: 70%;
      max-width: 700px;
      min-width: 500px;
      text-align: center;
      border: 4px solid #f5f5f5;
    }
    .alert-message {
      font-size: 32px;
      margin-bottom: 40px;
      color: #111111;
      line-height: 1.8;
      font-weight: 600;
      letter-spacing: 1px;
    }
    .alert-button {
      background-color: #1E4A9B;
      color: white;
      border: none;
      padding: 25px 50px;
      font-size: 28px;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 250px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      font-weight: 600;
      letter-spacing: 1px;
    }
    .alert-button:hover {
      background-color: #265BB8;
      transform: translateY(-3px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.3);
    }
    .alert-button:active {
      transform: translateY(2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    @media (max-width: 768px) {
      .alert-box {
        width: 90%;
        min-width: 90%;
        padding: 40px 30px;
      }
      .alert-message {
        font-size: 28px;
        margin-bottom: 30px;
      }
      .alert-button {
        font-size: 24px;
        padding: 20px 40px;
        min-width: 80%;
      }
    }
  `;
  document.head.appendChild(style);
}

function showAlert(message, buttonText = 'OK', onClose = null) {
  const overlay = document.createElement('div');
  overlay.className = 'alert-overlay';

  const alertBox = document.createElement('div');
  alertBox.className = 'alert-box';

  const messageElement = document.createElement('div');
  messageElement.className = 'alert-message';
  messageElement.textContent = message;

  const button = document.createElement('button');
  button.className = 'alert-button';
  button.textContent = buttonText;

  alertBox.appendChild(messageElement);
  alertBox.appendChild(button);
  overlay.appendChild(alertBox);
  document.body.appendChild(overlay);

  button.onclick = () => {
    document.body.removeChild(overlay);
    if (onClose) onClose();
  };
}

function showSuccess(message = 'Success!') {
  showAlert(message, 'OK');
}

function showError(message = 'An error occurred') {
  showAlert(message, 'Try Again');
}

injectAlertStyles();
