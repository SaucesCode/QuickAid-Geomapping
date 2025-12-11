import { api } from "../services/api";

export const getStaffFormLink = async () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  const baseURL = window.location.origin || process.env.REACT_APP_API_URL;

  const randomize = () => {
    return Math.random().toString(36).substring(2, 12);
  };

  if (user) {
    const encoded = btoa(user.ref_code);
    return `${baseURL}/apply?r=${randomize()}&k=${encoded}`;
  }

  // Otherwise fetch from backend
  try {
    const res = await api.get("/get-active-staff/");
    const staff = res.data;

    if (!staff?.ref_code) return null;

    const encoded = btoa(staff.ref_code);
    return `${baseURL}/apply?r=${randomize()}&k=${encoded}`;
  } catch (err) {
    console.error("Error fetching active staff", err);
    return null;
  }
};
