import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={{ name: payload.name as string, role: payload.role as string }} />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
