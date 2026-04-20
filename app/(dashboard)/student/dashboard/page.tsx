import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen, FileUp, CheckCircle, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "STUDENT") redirect("/login");

  const studentId = payload.id as string;

  // Fetch all assignments and student's submissions
  const assignments = await prisma.createdAssignment.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      submissions: {
        where: { studentId },
        take: 1
      },
      faculty: { select: { name: true } }
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Your Assignments</h1>
        <p className="text-slate-500 mt-1">Review and submit your pending coursework</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => {
            const hasSubmitted = assignment.submissions.length > 0;
            const submission = hasSubmitted ? assignment.submissions[0] : null;
            const isOverdue = new Date() > new Date(assignment.dueDate) && !hasSubmitted;

            return (
              <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="group drop-shadow-sm transition-all hover:drop-shadow-xl h-full">
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col hover:border-indigo-300 transition-colors">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                      {hasSubmitted ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center border border-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" /> Submitted
                        </span>
                      ) : isOverdue ? (
                        <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full flex items-center border border-red-100">
                          <Clock className="w-3 h-3 mr-1" /> Overdue
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full flex items-center border border-amber-100">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                        By: {assignment.faculty.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {assignment.title}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">{assignment.description}</p>
                  </div>
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="text-sm font-semibold text-slate-600">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                    {!hasSubmitted && (
                      <div className="text-indigo-600 font-medium text-sm flex items-center group-hover:underline">
                        Upload <FileUp className="h-4 w-4 ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No Assignments Found</h3>
            <p className="text-slate-500 mt-2">There are currently no assignments posted.</p>
          </div>
        )}
      </div>
    </div>
  );
}
