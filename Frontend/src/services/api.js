import axios from "axios";

const rawApi = import.meta.env.VITE_API_URL || "http://localhost:5179/api";
// normalize: remove trailing slashes and ensure "/api" suffix
const API_URL = rawApi.replace(/\/+$/, "").replace(/\/api$/, "") + "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token attached:", token.substring(0, 20) + "...");
    } else {
      console.log("❌ No token found!");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("❌ Unauthorized — token invalid or expired");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),
  login: (email, password) => api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  updateProfile: (name, email) => api.put("/auth/update", { name, email }),
};

export const expenseAPI = {
  addExpense: (title, amount, category) =>
    api.post("/expenses/add", { title, amount, category }),
  getAllExpenses: () => api.get("/expenses/all"),
  updateExpense: (id, title, amount, category) =>
    api.put("/expenses/update", { id, title, amount, category }),
  deleteExpense: (id) => api.delete(`/expenses/delete/${id}`),
};

export default api;
