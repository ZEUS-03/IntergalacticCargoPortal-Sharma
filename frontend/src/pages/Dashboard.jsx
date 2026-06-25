import React, { useEffect, useState } from "react";
import { fetchCargo, uploadManifest } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import CargoTable from "../components/CargoTable";

export default function Dashboard() {
  const { role, email, logout } = useAuth();
  const [cargo, setCargo] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadCargo() {
    setLoading(true);
    try {
      const data = await fetchCargo();
      setCargo(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus(error.body?.message || error.message || "Unable to load cargo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCargo();
  }, []);

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setStatus("");

    try {
      await uploadManifest(file);
      await loadCargo();
      setStatus("Manifest uploaded successfully.");
    } catch (error) {
      setStatus(error.body?.message || error.message || "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Operations dashboard</p>
          <h1>Welcome aboard, {email}</h1>
          <p>
            {role === "admin"
              ? "Admin controls are active for manifest uploads and cargo review."
              : "Standard access is limited to cargo visibility and reporting."}
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={logout}>
          Sign out
        </button>
      </header>

      <section className="dashboard-card">
        {role === "admin" ? (
          <label className="upload-control">
            <span>Upload Manifest</span>
            <input type="file" accept=".txt" onChange={handleFileUpload} />
            <span className="upload-hint">
              {uploading ? "Uploading…" : "TXT manifest only"}
            </span>
          </label>
        ) : null}

        {status ? <div className="status-banner">{status}</div> : null}

        {loading ? (
          <p className="loading-text">Loading cargo records…</p>
        ) : null}

        <CargoTable cargo={cargo} role={role} />
      </section>
    </main>
  );
}
