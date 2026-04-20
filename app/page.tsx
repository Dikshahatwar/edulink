import { redirect } from "next/navigation";

export default function Home() {
  // Redirect user to login page
  redirect("/login");

  return null; // (never reached, but required)
}