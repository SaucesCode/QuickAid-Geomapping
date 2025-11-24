import { api } from "../services/api";

export const getStaffFormLink = async () => {
  // First try localStorage
  const user = JSON.parse(localStorage.getItem("userData"));
  const baseURL = window.location.origin;

  if (user) {
    const encoded = btoa(user.ref_code);
    return `${baseURL}/apply?k=${encoded}`;
  }

  // Otherwise fetch from backend
  try {
    const res = await api.get("/get-active-staff/");
    const staff = res.data; // <-- FIXED (it's an object)

    if (!staff?.ref_code) return null;

    const encoded = btoa(staff.ref_code);
    return `${baseURL}/apply?k=${encoded}`;
  } catch (err) {
    console.error("Error fetching active staff", err);
    return null;
  }
};
