let editIndex = -1;
const password = "ArthaEDU";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxyX7eI3V-iWs1TgL80pTW2kPKKXKLSVzvSTk7KcpHYaU5BWQmnONUA2WZdF3pd_hpFQQ/exec";

// Load timetable data from Google Sheet
async function loadTimetable() {
  try {
    const res = await fetch(SHEET_URL);
    if (!res.ok) throw new Error("Network response was not ok");
    return await res.json();
  } catch (error) {
    console.error("Failed to load timetable:", error);
    alert("❌ Failed to load data. Check your Google Script URL or Internet.");
    return [];
  }
}

// Save new entry to Google Sheet
async function saveToSheet(entry) {
  try {
    await fetch(SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(entry),
      headers: {
        "Content-Type": "application/json"
      }
    });
    alert("✅ Data sent to sheet (but response can't be checked due to browser security)");
  } catch (error) {
    console.error("❌ Failed to send data:", error);
    alert("❌ Error sending to Google Sheet.");
  }
}

// Teacher Table
async function renderTeacherTable() {
  const data = await loadTimetable();
  const tbody = document.getElementById("teacherTableBody");
  tbody.innerHTML = "";
  data.forEach((entry, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.Teacher}</td>
      <td>${entry.Grade}</td>
      <td>${entry.Subject}</td>
      <td>${entry.Day}</td>
      <td>${entry.Time}</td>
      <td><i style="color:gray;">Not editable</i></td>`;
    tbody.appendChild(row);
  });
}

// Student Table
async function renderStudentTable() {
  const data = await loadTimetable();
  const grade = document.getElementById("filterGrade").value.toLowerCase();
  const day = document.getElementById("filterDay").value.toLowerCase();
  const subject = document.getElementById("filterSubject").value.toLowerCase();
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = "";

  const filtered = data.filter(e => {
  return (!grade || String(e.Grade).toLowerCase().includes(grade)) &&
         (!day || String(e.Day).toLowerCase().includes(day)) &&
         (!subject || String(e.Subject).toLowerCase().includes(subject));
});


  filtered.forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.Teacher}</td>
      <td>${entry.Grade}</td>
      <td>${entry.Subject}</td>
      <td>${entry.Day}</td>
      <td>${entry.Time}</td>`;
    tbody.appendChild(row);
  });

  if (filtered.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" style="text-align:center;">No data found</td>`;
    tbody.appendChild(row);
  }
}

// Form Submit
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("timetableForm");
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const entry = {
        Teacher: form.teacher.value,
        Grade: form.grade.value,
        Subject: form.subject.value,
        Day: form.day.value,
        Time: form.time.value
      };

      if (editIndex > -1) {
        alert("Editing existing entries is not supported in this version.");
        return;
      }

      await saveToSheet(entry);
      form.reset();
      await renderTeacherTable(); // update teacher view instantly
      // Also update student view if visible
      if (!document.getElementById("studentView").classList.contains("hidden")) {
        await renderStudentTable();
      }
    });
  }
});

// View control
function showTeacherLogin() {
  document.getElementById("viewSelector").classList.add("hidden");
  document.getElementById("passwordPrompt").classList.remove("hidden");
}

async function verifyPassword() {
  const input = document.getElementById("passwordInput").value;
  if (input === password) {
    document.getElementById("passwordPrompt").classList.add("hidden");
    await showView("teacher");
  } else {
    alert("Incorrect password!");
  }
}

async function showView(view) {
  document.getElementById("teacherView").classList.add("hidden");
  document.getElementById("studentView").classList.add("hidden");

  if (view === "teacher") {
    document.getElementById("teacherView").classList.remove("hidden");
    await renderTeacherTable();
  } else {
    document.getElementById("studentView").classList.remove("hidden");
    await renderStudentTable();
  }
}
