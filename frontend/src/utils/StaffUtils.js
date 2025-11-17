// utils/staffUtils.js
export const getStaffFormLink = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  if (!user) return null;
  const encoded = btoa(user.ref_code);

  const baseURL = window.location.origin;

  return `${baseURL}/apply?k=${encoded}`;
};
