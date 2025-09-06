import { useState } from "react";
import { api } from "../services/api";

export default function Approved() {
  const [file, setFile] = useState(null);

  const handleFile = e => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    await api.post("/upload-sheet/", formData);
    alert("File uploaded!");
  };

  return (
    <div>
      <h1>Approved</h1>
      <div>
        <input type="file" accept=".xlsx,.csv" onChange={handleFile} />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
}
