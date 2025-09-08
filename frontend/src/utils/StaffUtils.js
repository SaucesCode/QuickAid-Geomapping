// utils/staffUtils.js
export const getStaffFormLink = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  if (!user) return null;

  return `http://localhost:3000/new-applicant?staff_ref_code=${user.ref_code}`;
};
