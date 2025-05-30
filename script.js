let editIndex = -1;
const password = "ArthaEDU";

// Storage functions
const SHEET_URL = "https://script.google.com/macros/s/AKfycbxEOxbtcMg3EZ7HuVLr-qrdf33uU44Hfi90ZuBRJfqVHxkkZmeOtToxV8hcGJO8_Ign/exec"; // 🔁 Replace this with your actual Google Apps Script Web App URL

async function loadTimetable() {
  const res = await fetch(SHEET_URL);
  return await res.json();
}

async function saveToSheet(entry) {
  await fetch(SHEET_URL, {
    method: "POST",
    body: JSON.stringify(entry),
    headers: { "Content-Type": "application/json" }
  });
}


// Teacher Table
function renderTeacherTable() {
  const data = loadTimetable();
  const tbody = document.getElementById("teacherTableBody");
  tbody.innerHTML = "";
  data.forEach((entry, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.teacher}</td>
      <td>${entry.grade}</td>
      <td>${entry.subject}</td>
      <td>${entry.day}</td>
      <td>${entry.time}</td>
      <td>
        <button onclick="editEntry(${i})">Edit</button>
        <button onclick="deleteEntry(${i})">Delete</button>
      </td>`;
    tbody.appendChild(row);
  });
}

// Student Table
function renderStudentTable() {
  const data = loadTimetable();
  const grade = document.getElementById("filterGrade").value.toLowerCase();
  const day = document.getElementById("filterDay").value.toLowerCase();
  const subject = document.getElementById("filterSubject").value.toLowerCase();
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = "";

  data.filter(e =>
    e.grade.toLowerCase().includes(grade) &&
    e.day.toLowerCase().includes(day) &&
    e.subject.toLowerCase().includes(subject)
  ).forEach(entry => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.teacher}</td>
      <td>${entry.grade}</td>
      <td>${entry.subject}</td>
      <td>${entry.day}</td>
      <td>${entry.time}</td>`;
    tbody.appendChild(row);
  });
}

// Edit/Delete
function editEntry(index) {
  const entry = loadTimetable()[index];
  document.getElementById("teacher").value = entry.teacher;
  document.getElementById("grade").value = entry.grade;
  document.getElementById("subject").value = entry.subject;
  document.getElementById("day").value = entry.day;
  document.getElementById("time").value = entry.time;
  editIndex = index;
}
function deleteEntry(index) {
  const data = loadTimetable();
  if (confirm("Are you sure?")) {
    data.splice(index, 1);
    saveTimetable(data);
    renderTeacherTable();
  }
}

// Form Submit
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("timetableForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const entry = {
        teacher: form.teacher.value,
        grade: form.grade.value,
        subject: form.subject.value,
        day: form.day.value,
        time: form.time.value
      };
      const data = loadTimetable();
      if (editIndex > -1) {
        data[editIndex] = entry;
        editIndex = -1;
      } else {
        data.push(entry);
      }
      saveTimetable(data);
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

function verifyPassword() {
  const input = document.getElementById("passwordInput").value;
  if (input === password) {
    document.getElementById("passwordPrompt").classList.add("hidden");
    showView("teacher");
  } else {
    alert("Incorrect password!");
  }
}

function showView(view) {
  document.getElementById("teacherView").classList.add("hidden");
  document.getElementById("studentView").classList.add("hidden");

  if (view === "teacher") {
    document.getElementById("teacherView").classList.remove("hidden");
    renderTeacherTable();
  } else {
    document.getElementById("studentView").classList.remove("hidden");
    renderStudentTable();
  }
}
