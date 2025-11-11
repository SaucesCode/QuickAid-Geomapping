// utils/staffUtils.js
export const getStaffFormLink = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  if (!user) return null;

  return `${process.env.REACT_APP_BASE_URL}/new-applicant?staff_ref_code=${user.ref_code}`;
};
