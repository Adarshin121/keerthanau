import React, { useState } from "react";
import axios from "axios";
import { Button, Typography, Box } from "@mui/material";

const BulkUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:3006/api/user/bulkupload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Upload failed");
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h5" gutterBottom>Bulk Upload Users</Typography>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleUpload}
      >
        Upload
      </Button>
      {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
    </Box>
  );
};

export default BulkUpload;
