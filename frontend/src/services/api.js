import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const API_URL = process.env.REACT_APP_API_URL;
// export const API_URL = "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_URL,
});

// ✅ Store tokens
const storeTokens = (access, refresh) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

// ✅ Decode and check expiration
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

// ✅ Logout user cleanly
export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
};

// ✅ Refresh token function
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null;

  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, {
      refresh: refreshToken,
    });

    if (response.status === 200) {
      const { access } = response.data;
      storeTokens(access, refreshToken);
      return access;
    }
  } catch (error) {
    console.error("🔒 Token refresh failed:", error.response?.data || error);
    logoutUser();
    return null;
  }
};

// ✅ Axios request interceptor
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem("accessToken");

    // 🔹 Refresh if expired
    if (accessToken && isTokenExpired(accessToken)) {
      if (!isRefreshing) {
        isRefreshing = true;
        accessToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(accessToken);
      } else {
        // Wait until refresh finishes
        accessToken = await new Promise((resolve) => {
          subscribeTokenRefresh(resolve);
        });
      }
    }

    // 🔹 Attach token to headers
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor (handle global 401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("🚫 Unauthorized request, redirecting to login...");
      logoutUser();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ✅ Login
export const loginStaff = async (username, password) => {
  try {
    const response = await api.post(`/token/`, { username, password });

    if (response.status === 200) {
      const { access, refresh, staff_info: user } = response.data;
      storeTokens(access, refresh);
      localStorage.setItem("userData", JSON.stringify(user));
      return response.data;
    }
  } catch (error) {
    console.error("Login Error:", error.response?.data);
    throw new Error("Login failed");
  }
};

// ✅ Check token validity (optional auto-logout)
export const checkTokenValidity = () => {
  const token = localStorage.getItem("accessToken");
  if (!token || isTokenExpired(token)) logoutUser();
};

// ✅ Submit Applicant
export const submitApplicant = async (data) => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const staffRefCode = urlParams.get("staff_ref_code");

    const background_info = {
      first_name: data.first_name,
      middle_initial: data.middle_initial,
      last_name: data.last_name,
      suffix: data.suffix,
      birthday: data.birthday,
      street_address: data.street_address,
      barangay: data.barangay,
      sex: data.sex,
      civil_status: data.civil_status,
      occupation: data.occupation,
      monthly_income: data.monthly_income,
    };

    const payload = {
      staff_ref_code: staffRefCode,
      background_info,
      contact_number: data.contact_number,
      valid_id_presented: data.valid_id_presented,
      other_valid_id: data.other_valid_id || null,
      applicant_type: data.applicant_type || "Self",
      type_of_assistance: data.type_of_assistance,
      date_filled: data.date_filled,
      created_at: data.created_at,
    };

    if (data.applicant_type === "Representative") {
      payload.representative = {
        relationship: data.rep_relationship,
        background_info: {
          first_name: data.rep_first_name,
          middle_initial: data.rep_middle_initial,
          last_name: data.rep_last_name,
          suffix: data.rep_suffix,
          birthday: data.rep_birthday,
          street_address: data.rep_address,
          barangay: data.rep_barangay,
          sex: data.rep_gender,
          civil_status: data.rep_civil_status,
          occupation: data.rep_occupation,
          monthly_income: data.rep_monthly_income,
        },
      };
    }

    const response = await api.post(`/submit-applicant/`, payload);
    return response.data;
  } catch (error) {
    console.error("Submission Error:", error.response?.data);
    throw error.response?.data || "Submission failed";
  }
};
