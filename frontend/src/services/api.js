import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // Django backend URL

// ✅ Function to store tokens in localStorage
const storeTokens = (access, refresh) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

// ✅ Function to refresh the access token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) return null; // No refresh token available

  try {
    const response = await axios.post(`${API_URL}/token/refresh/`, { refresh: refreshToken });

    if (response.status === 200) {
      const { access } = response.data;
      storeTokens(access, refreshToken); // ✅ Store new access token
      return access;
    }
  } catch (error) {
    console.error("Token refresh failed", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
};

// ✅ Create an axios instance with authentication headers
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Axios request interceptor to auto-refresh token
api.interceptors.request.use(
  async config => {
    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      accessToken = await refreshAccessToken();
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

export const loginStaff = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, { username, password });

    if (response.status === 200) {
      const { access, refresh, staff_info: user } = response.data;

      // Store tokens in localStorage
      storeTokens(access, refresh);

      // Store user object in localStorage
      localStorage.setItem("userData", JSON.stringify(user));

      return response.data; // Return response with user data
    }
  } catch (error) {
    console.error("Login Error:", error.response?.data);
    throw new Error("Login failed");
  }
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");

  // Optional: clear more things if you store session-like info
  window.location.href = "/login";
};

// ✅ Register Applicant Function
export const submitApplicant = async data => {
  try {
    let token = localStorage.getItem("accessToken");

    if (!token) {
      token = await refreshAccessToken();
      if (!token) throw new Error("No authentication token found");
    }

    // Base payload
    const payload = {
      first_name: data.first_name,
      middle_initial: data.middle_initial,
      last_name: data.last_name,
      suffix: data.suffix,
      contact_number: data.contact_number,
      purok: data.purok,
      barangay: data.barangay,
      city_municipality: data.city_municipality,
      province: data.province,
      birthday: data.birthday,
      gender: data.gender,
      civil_status: data.civil_status,
      occupation: data.occupation,
      monthly_income: data.monthly_income,
      valid_id_presented: data.valid_id_presented,
      type_of_assistance: data.type_of_assistance,
      applicant_type: data.applicant_type || "Self", // Add this
      processed_at: data.processed_at,
    };

    // If representative, add rep-specific fields
    if (data.applicant_type === "Representative") {
      Object.assign(payload, {
        rep_first_name: data.rep_first_name,
        rep_middle_initial: data.rep_middle_initial,
        rep_last_name: data.rep_last_name,
        rep_suffix: data.rep_suffix,
        rep_address: data.rep_address,
        rep_birthday: data.rep_birthday,
        rep_gender: data.rep_gender,
        rep_civil_status: data.rep_civil_status,
        rep_occupation: data.rep_occupation,
        rep_monthly_income: data.rep_monthly_income,
        rep_relationship: data.rep_relationship,
      });
    }

    const response = await axios.post(`${API_URL}/submit-applicant/`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Submission Error:", error.response?.data);
    throw error.response?.data || "Submission failed";
  }
};
