"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, BookOpen, User } from "lucide-react";

export default function Navbar({ user }: { user: { name: string; role: string } | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!user || pathname === "/login") return null;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg shadow-md flex items-center justify-center">
                <BookOpen className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700">
                EduLink
              </span>
            </div>
            <div className="ml-6 flex space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                {user.role} Portal
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="bg-slate-100 p-2 rounded-full">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium hidden sm:block">{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
