let editIndex = -1;
const password = "ArthaEDU";
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxEOxbtcMg3EZ7HuVLr-qrdf33uU44Hfi90ZuBRJfqVHxkkZmeOtToxV8hcGJO8_Ign/exec";

// Load timetable data from Google Sheet
async function loadTimetable() {
  const res = await fetch(SHEET_URL);
  return await res.json();
}

// Save new entry to Google Sheet
async function saveToSheet(entry) {
  await fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(entry),
    headers: { "Content-Type": "application/json" }
  });
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

  data.filter(e =>
    e.Grade.toLowerCase().includes(grade) &&
    e.Day.toLowerCase().includes(day) &&
    e.Subject.toLowerCase().includes(subject)
  ).forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.Teacher}</td>
      <td>${entry.Grade}</td>
      <td>${entry.Subject}</td>
      <td>${entry.Day}</td>
      <td>${entry.Time}</td>`;
    tbody.appendChild(row);
  });
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
      renderTeacherTable();
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
