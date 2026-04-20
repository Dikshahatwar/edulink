import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AssignmentDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ FIX: unwrap params (Next.js 15+)
  const { id } = await params;

  // 📊 Fetch submissions
  const submissions = await prisma.submission.findMany({
    where: {
      assignmentId: id,
    },
    include: {
      student: true,
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* 🔙 Back */}
      <Link href="/faculty/dashboard" className="text-blue-600">
        ← Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">
        Student Submissions
      </h1>

      {submissions.length === 0 ? (
        <p>No submissions yet</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border p-4 rounded-lg shadow"
            >
              {/* 👤 Student Info */}
              <h2 className="font-semibold">
                {sub.student.name}
              </h2>

              <p className="text-sm text-gray-500">
                {sub.student.email}
              </p>

              {/* 📅 Date */}
              <p className="mt-2">
                Submitted at:{" "}
                {new Date(sub.submittedAt).toLocaleString()}
              </p>

              {/* 📄 File */}
              <p className="mt-2">
                File: {sub.filePath}
              </p>

              {/* 📊 Plagiarism */}
              <p
                className={`mt-2 font-semibold ${
                  (sub.plagiarismScore || 0) > 30
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                Plagiarism:{" "}
                {sub.plagiarismScore?.toFixed(1) || 0}%
              </p>

              {/* 🔽 OPTIONAL: Download button */}
              <a
                href={`/uploads/${sub.filePath}`}
                target="_blank"
                className="inline-block mt-3 text-blue-600 underline"
              >
                Download File
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}