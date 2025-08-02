document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("medCalendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay"
    },
     eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  },
    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch("/medications");
        const meds = await res.json();

        const events = meds.map(med => {
          return {
            title: `${med.name} (${med.dosage})`,
            start: med.start_date,
            end: med.end_date || med.start_date,
            color: "#1E4A9B"
          };
        });

        successCallback(events);
      } catch (err) {
        console.error("Failed to load medications for calendar:", err);
        failureCallback(err);
      }
    }
  });

  calendar.render();
});
