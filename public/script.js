// API Configuration
const API_BASE = "/api/v1";
axios.defaults.baseURL = API_BASE;

// State Management
let currentUser = null;

// Utility Functions
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message, isSuccess = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast ${isSuccess ? "success" : "error"} show`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Authentication Functions
function setAuthToken(token) {
  if (token) {
    localStorage.setItem("cs_token", token);
    axios.defaults.headers.common["token"] = token;
    document.getElementById("btn-logout").style.display = "inline-block";
    document.getElementById("btn-login").style.display = "none";
    currentUser = { token };
  } else {
    localStorage.removeItem("cs_token");
    delete axios.defaults.headers.common["token"];
    document.getElementById("btn-logout").style.display = "none";
    document.getElementById("btn-login").style.display = "inline-block";
    currentUser = null;
  }
}

function getToken() {
  return localStorage.getItem("cs_token");
}

// Course Functions
async function loadCourses() {
  try {
    const res = await axios.get("/course/preview");
    const courses = res.data.courses || [];
    renderCourses(courses);
  } catch (err) {
    console.error(err);
    showToast("Failed to load courses");
  }
}

function renderCourses(courses) {
  const grid = document.getElementById("coursesGrid");
  grid.innerHTML = "";

  if (courses.length === 0) {
    grid.innerHTML =
      '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">No courses available at the moment.</p>';
    return;
  }

  courses.forEach((course) => {
    const card = document.createElement("div");
    card.className = "course-card";
    const imgUrl =
      course.imageUrl || `https://picsum.photos/seed/${course._id}/400/200`;

    card.innerHTML = `
      <div class="course-image" style="background-image:url('${imgUrl}')"></div>
      <div class="course-content">
        <h3 class="course-title">${escapeHtml(
          course.title || "Untitled Course"
        )}</h3>
        <p class="course-description">${escapeHtml(
          course.description || "No description available."
        )}</p>
        <div class="course-meta">
          <div class="course-price">$${course.price ?? 0}</div>
          <button class="btn btn-primary" onclick="enrollCourse('${
            course._id
          }')">Enroll</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

async function enrollCourse(courseId) {
  const token = getToken();
  if (!token) {
    openAuthModal("signin");
    showToast("Please sign in to enroll in a course");
    return;
  }

  try {
    await axios.post("/course/purchase", { courseId });
    showToast("Successfully enrolled in the course!", true);
  } catch (err) {
    console.error(err);
    showToast(err.response?.data?.message || "Enrollment failed");
  }
}

async function loadMyCourses() {
  const token = getToken();
  if (!token) {
    showToast("Please sign in to view your courses");
    return;
  }

  try {
    const res = await axios.get("/user/purchases");
    const courses = res.data.course || [];
    renderMyCourses(courses);
  } catch (err) {
    console.error(err);
    showToast("Failed to load your courses");
  }
}

function renderMyCourses(courses) {
  const grid = document.getElementById("myCoursesGrid");
  grid.innerHTML = "";

  if (courses.length === 0) {
    grid.innerHTML =
      '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">You haven\'t enrolled in any courses yet.</p>';
    return;
  }

  courses.forEach((course) => {
    const card = document.createElement("div");
    card.className = "course-card";
    const imgUrl =
      course.imageUrl || `https://picsum.photos/seed/${course._id}/400/200`;

    card.innerHTML = `
      <div class="course-image" style="background-image:url('${imgUrl}')"></div>
      <div class="course-content">
        <h3 class="course-title">${escapeHtml(
          course.title || "Untitled Course"
        )}</h3>
        <p class="course-description">${escapeHtml(
          course.description || "No description available."
        )}</p>
        <div class="course-meta">
          <div class="course-price">Enrolled</div>
          <button class="btn btn-outline">Continue</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Modal Functions
function openAuthModal(mode = "signin") {
  const modal = document.getElementById("authModal");
  document.getElementById("authTitle").textContent =
    mode === "signup" ? "Create Account" : "Sign In";
  document.getElementById("nameRow").style.display =
    mode === "signup" ? "block" : "none";
  document.getElementById("authSubmit").textContent =
    mode === "signup" ? "Create Account" : "Sign In";
  modal.dataset.mode = mode;
  modal.classList.add("active");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  modal.classList.remove("active");
  document.getElementById("authForm").reset();
  document.getElementById("authFeedback").textContent = "";
}

async function submitAuthForm(e) {
  e.preventDefault();
  const mode = document.getElementById("authModal").dataset.mode || "signin";
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;

  try {
    if (mode === "signup") {
      await axios.post("/user/signup", {
        email,
        password,
        firstName,
        lastName,
      });
      showToast("Account created successfully! Please sign in.", true);
      openAuthModal("signin");
    } else {
      const res = await axios.post("/user/signin", { email, password });
      const token = res.data.token;
      if (token) {
        setAuthToken(token);
        closeAuthModal();
        loadMyCourses();
        showToast("Signed in successfully!", true);
      } else {
        showToast("Sign in failed");
      }
    }
  } catch (err) {
    console.error(err);
    showToast(err.response?.data?.message || "Authentication failed");
  }
}

function logout() {
  setAuthToken(null);
  showToast("Signed out successfully");
  document.getElementById("nav-courses").click();
}

// Navigation Functions
function showCourses() {
  document.getElementById("courses-section").style.display = "block";
  document.getElementById("mycourses-section").style.display = "none";
  document.getElementById("nav-courses").classList.add("active");
  document.getElementById("nav-my").classList.remove("active");
}

function showMyCourses() {
  document.getElementById("courses-section").style.display = "none";
  document.getElementById("mycourses-section").style.display = "block";
  document.getElementById("nav-courses").classList.remove("active");
  document.getElementById("nav-my").classList.add("active");
  loadMyCourses();
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  // Set up event listeners
  document
    .getElementById("btn-login")
    .addEventListener("click", () => openAuthModal("signin"));
  document
    .getElementById("cta-signup")
    .addEventListener("click", () => openAuthModal("signup"));
  document
    .getElementById("modalClose")
    .addEventListener("click", closeAuthModal);
  document
    .getElementById("authForm")
    .addEventListener("submit", submitAuthForm);
  document.getElementById("btn-logout").addEventListener("click", logout);

  document.getElementById("nav-courses").addEventListener("click", showCourses);
  document.getElementById("nav-my").addEventListener("click", showMyCourses);
  document.getElementById("cta-explore").addEventListener("click", () => {
    document
      .getElementById("courses-section")
      .scrollIntoView({ behavior: "smooth" });
  });

  // Search functionality
  document.getElementById("search").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll("#coursesGrid .course-card");

    cards.forEach((card) => {
      const title = card
        .querySelector(".course-title")
        .textContent.toLowerCase();
      card.style.display = title.includes(query) ? "block" : "none";
    });
  });

  // Initialize auth state
  const token = getToken();
  if (token) {
    setAuthToken(token);
  }

  // Load initial data
  loadCourses();
});
