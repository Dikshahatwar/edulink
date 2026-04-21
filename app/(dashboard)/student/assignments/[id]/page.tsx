"use client";

import { useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  File,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function StudentAssignmentSubmit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 📌 Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      if (
        selectedFile.type !== "text/plain" &&
        selectedFile.type !== "application/pdf" &&
        !selectedFile.type.startsWith("image/")
      ) {
        setError("Only TXT, PDF or Image files are supported.");
        setFile(null);
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File too large (max 5MB)");
        return;
      }

      setFile(selectedFile);
      setError("");
    }
  };

  // 📌 Upload logic
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("assignmentId", id);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(true);
      setPlagiarismScore(data.submission.plagiarismScore);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 🔙 Back */}
      <Link
        href="/student/dashboard"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-2xl shadow border border-slate-200">
        {/* HEADER */}
        <div className="p-6 border-b bg-slate-50">
          <h1 className="text-2xl font-bold">Submit Assignment</h1>
          <p className="text-slate-500">
            Upload your work for plagiarism analysis.
          </p>
        </div>

        <div className="p-6">
          {/* 📥 DOWNLOAD */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">
              Assignment File
            </h3>

            <a
              href="/uploads/sample.pdf"
              download
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
            >
              <File className="h-4 w-4" />
              Download Assignment
            </a>
          </div>

          {/* ✅ SUCCESS */}
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h2 className="text-xl font-bold">Submitted!</h2>

              {plagiarismScore !== null && (
                <p className="mt-3 text-lg">
                  Plagiarism:{" "}
                  <span
                    className={
                      plagiarismScore > 30
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {plagiarismScore.toFixed(1)}%
                  </span>
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpload} className="space-y-6">

              {/* 🔥 SUBMIT BUTTON AT TOP (ALWAYS VISIBLE) */}
              {/* <button
                type="submit"
                style={{
                  width: "100%",
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {loading ? "Uploading..." : "Submit Assignment"}
              </button> */}

              {/* 📤 DROP ZONE */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center ${
                  file ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files[0];
                  if (dropped) setFile(dropped);
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".txt, .pdf, image/*"
                  onChange={handleFileChange}
                />

                {file ? (
                  <div>
                    <File className="mx-auto mb-2" />
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>

                    {file.type.startsWith("image/") && (
                      <img
                        src={URL.createObjectURL(file)}
                        className="mt-3 h-32 mx-auto rounded"
                      />
                    )}

                    <button
                      type="button"
                      className="text-red-500 mt-2"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-3" />
                    <p>Drag & drop or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600"
                    >
                      Browse
                    </button>
                    <p className="text-xs mt-2">
                      PDF, TXT, Image (max 5MB)
                    </p>
                  </div>
                )}
              </div>

              {/* ❌ ERROR */}
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded flex gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  {error}
                </div>
              )}

              {/* 🔽 BOTTOM BUTTON (optional, now always visible too) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg"
              >
                {loading ? "Uploading..." : "Submit Assignment"}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}