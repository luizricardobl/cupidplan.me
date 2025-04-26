import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Album.css";

const Album = () => {
  const email =
    localStorage.getItem("rememberedUser") || sessionStorage.getItem("loggedInUser");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // 🔄 Load existing photos on mount
  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user/album/${email}`);
        if (res.data.success) {
          setAlbumPhotos(res.data.album || []);
        }
      } catch (err) {
        console.error("Failed to load album:", err);
      }
    };

    fetchAlbum();
  }, [email]);

  // 📤 Handle file selection
  const handleFileChange = (e) => {
    const selected = [...e.target.files];
    if (selected.length > 10) {
      alert("You can only upload up to 10 photos.");
      return;
    }
    setSelectedFiles(selected);
    setPreviewUrls(selected.map((file) => URL.createObjectURL(file)));
  };

  // 📤 Upload photos
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setSuccessMsg("");

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("photos", file));
    formData.append("email", email);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/upload/photo-album`, formData);
      if (res.data.success) {
        setSuccessMsg("✅ Photos uploaded successfully!");
        setSelectedFiles([]);
        setPreviewUrls([]);
        setAlbumPhotos(res.data.album); // update with new list
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Something went wrong!");
    } finally {
      setUploading(false);
    }
  };

  // 🗑️ Delete photo from album
  const handleDeletePhoto = async (photoUrl) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios({
        method: "DELETE",
        url: `${API_BASE_URL}/api/upload/photo-album/delete`,
        data: { email, photoUrl },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (res.data.success) {
        setAlbumPhotos((prev) => prev.filter((url) => url !== photoUrl));
        setDeleteMsg("🗑️ Photo deleted successfully!");
        setTimeout(() => setDeleteMsg(""), 3000); // Hide after 3 seconds
      }
    } catch (err) {
      console.error("Failed to delete photo:", err);
      alert("Could not delete photo.");
    }
  };
  
  

  return (
    <div className="album-upload-container">
      <h2>📸 Upload to Your Photo Album</h2>
      <input type="file" multiple accept="image/*" onChange={handleFileChange} />
      <div className="album-preview-grid">
        {previewUrls.map((url, i) => (
          <img key={i} src={url} alt={`Preview ${i + 1}`} className="album-preview-img" />
        ))}
      </div>
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Photos"}
      </button>
      {successMsg && <p className="success-msg">{successMsg}</p>}
      {deleteMsg && <p className="success-msg">{deleteMsg}</p>}


      <hr />
      <h3>Your Photo Album</h3>
      <div className="album-preview-grid">
        {albumPhotos.map((url, i) => (
          <div key={i} className="photo-item">
            <img
              src={url}
              alt={`Photo ${i + 1}`}
              className="album-photo"
              onClick={() => setEnlargedImage(url)}
            />
            <button className="delete-photo-btn" onClick={() => handleDeletePhoto(url)}>
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox Enlarged View */}
      {enlargedImage && (
        <div className="lightbox" onClick={() => setEnlargedImage(null)}>
          <img src={enlargedImage} alt="Enlarged" className="lightbox-img" />
        </div>
      )}
    </div>
  );
};

export default Album;
