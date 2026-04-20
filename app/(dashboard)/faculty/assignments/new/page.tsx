"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, File } from "lucide-react";
import Link from "next/link";

export default function NewAssignment() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedDate: "",
    submissionDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("assignedDate", formData.assignedDate);
      data.append("submissionDate", formData.submissionDate);

      if (file) data.append("file", file);

      const res = await fetch("/api/assignments", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to create assignment");
      }

      router.push("/faculty/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* BACK */}
        <Link
          href="/faculty/dashboard"
          className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow border border-slate-200">

          {/* HEADER */}
          <div className="p-6 border-b bg-slate-50">
            <h1 className="text-2xl font-bold">Create New Assignment</h1>
            <p className="text-slate-500 mt-1">
              Add assignment details and upload file.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <button
  type="submit"
  disabled={loading}
  style={{
    width: "100%",
    backgroundColor: "#2563eb", // blue
    color: "white",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px"
  }}
>
  {loading ? "Saving..." : "Publish Assignment"}
</button>
            

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Assignment Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description
              </label>
              <textarea
                required
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
              />
            </div>

            {/* ASSIGNED DATE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Assigned Date
              </label>
              <input
                type="date"
                required
                value={formData.assignedDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedDate: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-xl"
              />
            </div>

            {/* SUBMISSION DATE */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Submission Date
              </label>
              <input
                type="date"
                required
                value={formData.submissionDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    submissionDate: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-xl"
              />
            </div>

            {/* FILE UPLOAD */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Upload File (PDF/Image)
              </label>

              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept=".pdf, image/*"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />

                {file && (
                  <div className="mt-3 flex flex-col items-center">
                    <File className="h-6 w-6 text-indigo-500" />
                    <p className="text-sm font-semibold">{file.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded">
                {error}
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}