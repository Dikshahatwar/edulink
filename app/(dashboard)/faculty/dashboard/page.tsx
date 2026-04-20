import { BookOpen } from "lucide-react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Users, FileText, Calendar } from "lucide-react";
import { redirect } from "next/navigation";

export default async function FacultyDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "FACULTY") redirect("/login");

  const assignments = await prisma.createdAssignment.findMany({
    where: { facultyId: payload.id as string },
    include: {
      _count: {
        select: { submissions: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Assignments</h1>
          <p className="text-slate-500 mt-1">Manage and grade your course assignments</p>
        </div>
        <Link 
          href="/faculty/assignments/new" 
          className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Assignment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Link key={assignment.id} href={`/faculty/assignments/${assignment.id}`} className="group drop-shadow-sm transition-all hover:drop-shadow-xl">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col hover:border-indigo-300 transition-colors">
                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                      ID: {assignment.id.substring(0, 6)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{assignment.title}</h3>
                  <p className="text-slate-500 text-sm mt-2 line-clamp-2">{assignment.description}</p>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm font-medium text-slate-600">
                    <Users className="h-4 w-4 mr-1.5 text-slate-400" />
                    {assignment._count.submissions} Submissions
                  </div>
                  <div className="flex items-center text-sm font-medium text-slate-600">
                    <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">No Assignments Yet</h3>
            <p className="text-slate-500 max-w-md mt-2">Get started by creating your first assignment. Students will be able to see it and submit their work.</p>
          </div>
        )}
      </div>
    </div>
  );
}
