export const formatDate = dateStr => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-PH", options);
};
