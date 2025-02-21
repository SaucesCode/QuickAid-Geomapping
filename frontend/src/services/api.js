import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // Django backend URL

export const loginStaff = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login/`, { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem("accessToken", access); // Save token for future use
    localStorage.setItem("refreshToken", refresh);
    return response.data; // Returns tokens
  } catch (error) {
    throw error.response?.data || "Login failed";
  }
};

export const submitApplicant = async data => {
  try {
    const token = localStorage.getItem("accessToken"); // ✅ Retrieve token

    if (!token) throw new Error("No authentication token found");

    const response = await axios.post(`${API_URL}/api/submit-applicant/`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Attach token in headers
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || "Submission failed";
  }
};

// Create an axios instance with authentication headers
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptor to include token in requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
