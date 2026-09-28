/**
 * Authentication and Student Registration Management
 * Prevents unauthorized access and manages student profiles.
 */

const STORAGE_USERS = "ICAI_STUDENTS_REGISTRY_V1";
const STORAGE_SESSION = "ICAI_ACTIVE_SESSION_V1";

const Auth = {
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_ICAI_SECURE_SALT_2026");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },

  getAllUsers() {
    try {
      const stored = localStorage.getItem(STORAGE_USERS);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load users", e);
      return [];
    }
  },

  saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users", e);
    }
  },

  getCurrentUser() {
    try {
      const session = localStorage.getItem(STORAGE_SESSION);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(STORAGE_SESSION);
    } else {
      // Don't store password hash in session
      const safeUser = { ...user };
      delete safeUser.passwordHash;
      localStorage.setItem(STORAGE_SESSION, JSON.stringify(safeUser));
    }
  },

  isLoggedIn() {
    return Boolean(this.getCurrentUser());
  },

  async register({ name, regNo, phone, email, dob, attempt, examGroup, password }) {
    const normalizedRegNo = (regNo || "").trim().toUpperCase();
    const users = this.getAllUsers();

    // Validation
    if (!name || !name.trim()) throw new Error("Full Name is required.");
    if (!normalizedRegNo) throw new Error("Student Registration No. is required.");
    if (!phone || !/^\d{10}$/.test(phone.trim().replace(/[-+\s]/g, ""))) {
      throw new Error("Please enter a valid 10-digit Phone Number.");
    }
    if (!email || !/\S+@\S+\.\S+/.test(email.trim())) {
      throw new Error("Please enter a valid Email Address.");
    }
    if (!dob) throw new Error("Date of Birth is required.");
    if (!attempt) throw new Error("Attempt of Exam is required.");
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Check if Registration No. already exists
    const existing = users.find(u => u.regNo.toUpperCase() === normalizedRegNo);
    if (existing) {
      throw new Error(`Student Registration No. (${normalizedRegNo}) is already registered. Please log in.`);
    }

    const passwordHash = await this.hashPassword(password);
    const newUser = {
      name: name.trim(),
      regNo: normalizedRegNo,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      dob,
      attempt,
      examGroup: ["G1", "G2", "BOTH"].includes(examGroup) ? examGroup : "BOTH",
      passwordHash,
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return newUser;
  },

  async login(regNo, password) {
    const normalizedRegNo = (regNo || "").trim().toUpperCase();
    if (!normalizedRegNo) throw new Error("Please enter your Student Registration No.");
    if (!password) throw new Error("Please enter your password.");

    const users = this.getAllUsers();
    const user = users.find(u => u.regNo.toUpperCase() === normalizedRegNo);

    if (!user) {
      throw new Error("Student Registration No. not found. Please create an account first.");
    }

    const inputHash = await this.hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new Error("Incorrect Password. Please check your credentials.");
    }

    this.setCurrentUser(user);
    return user;
  },

  async loginDemo() {
    const demoUser = {
      name: "CA Final Aspirant (Demo)",
      regNo: "WRO0897654",
      phone: "9876543210",
      email: "demo.student@icai.org",
      dob: "2001-05-15",
      attempt: "Nov 2026",
      examGroup: "BOTH",
      registeredAt: new Date().toISOString()
    };
    this.setCurrentUser(demoUser);
    return demoUser;
  },

  logout() {
    this.setCurrentUser(null);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
