import axios from "axios";

// Backend manzili .env faylidagi VITE_BACKEND_URL dan olinadi
const BASE = (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const api = axios.create({ baseURL: `${BASE}/api/` });

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// Token eskirgan yoki noto'g'ri bo'lsa — tizimdan chiqaramiz
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

/** Serverdan kelgan xatoni foydalanuvchi uchun matnga aylantiradi */
export function errorMessage(error, fallback = "Xatolik yuz berdi. Qayta urinib ko'ring.") {
  if (!error.response) return "Serverga ulanib bo'lmadi. Internetni tekshiring.";
  const data = error.response.data;
  if (typeof data === "string") return fallback;
  if (data?.detail) return data.detail;
  const first = data && Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  if (typeof first === "string") return first;
  return fallback;
}

export const login = (username, password) =>
  api.post("auth/login/", { username, password }).then((r) => r.data);
export const register = (data) => api.post("auth/register/", data).then((r) => r.data);
export const fetchMe = () => api.get("me/").then((r) => r.data);
export const fetchClasses = () => api.get("classes/").then((r) => r.data);

export const fetchAssignments = () => api.get("assignments/").then((r) => r.data);
export const fetchAssignment = (id) => api.get(`assignments/${id}/`).then((r) => r.data);
export const createAssignment = (formData) =>
  api.post("assignments/", formData).then((r) => r.data);
export const deleteAssignment = (id) => api.delete(`assignments/${id}/`);

export const fetchSubmissions = (id) =>
  api.get(`assignments/${id}/submissions/`).then((r) => r.data);
export const submitHomework = (id, formData, onProgress) =>
  api
    .post(`assignments/${id}/submit/`, formData, {
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded * 100) / e.total)),
    })
    .then((r) => r.data);
export const gradeSubmission = (id, grade, feedback) =>
  api.post(`submissions/${id}/grade/`, { grade, feedback }).then((r) => r.data);

export default api;

// ---------- Administrator paneli ----------
export const adminStats = () => api.get("admin/stats/").then((r) => r.data);

export const adminClasses = () => api.get("admin/classes/").then((r) => r.data);
export const adminSaveClass = (id, data) =>
  (id ? api.patch(`admin/classes/${id}/`, data) : api.post("admin/classes/", data)).then((r) => r.data);
export const adminDeleteClass = (id) => api.delete(`admin/classes/${id}/`);

export const adminUsers = (params) => api.get("admin/users/", { params }).then((r) => r.data);
export const adminSaveUser = (id, data) =>
  (id ? api.patch(`admin/users/${id}/`, data) : api.post("admin/users/", data)).then((r) => r.data);
export const adminDeleteUser = (id) => api.delete(`admin/users/${id}/`);

// ---------- Xabarnomalar ----------
export const fetchNotifications = () => api.get("notifications/").then((r) => r.data);
export const fetchUnreadCount = () => api.get("notifications/unread_count/").then((r) => r.data.count);
export const markNotificationRead = (id) => api.post(`notifications/${id}/mark_read/`).then((r) => r.data);
export const markAllNotificationsRead = () => api.post("notifications/mark_all_read/");

export const changeMyPassword = (old_password, new_password) =>
  api.post("me/password/", { old_password, new_password }).then((r) => r.data);

// ---------- Streak, yutuqlar, sinf ----------
export const fetchMyStats = () => api.get("me/stats/").then((r) => r.data);
export const fetchMyClass = () => api.get("my-class/").then((r) => r.data);
