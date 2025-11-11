// utils/staffUtils.js
export const getStaffFormLink = () => {
  const user = JSON.parse(localStorage.getItem("userData"));
  if (!user) return null;

  return `https://quick-aid-geomappingv1.vercel.app/new-applicant?staff_ref_code=${user.ref_code}`;
};
