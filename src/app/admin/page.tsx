import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { analyticsEnabled } from "@/lib/analytics/enabled";

export const metadata: Metadata = { title: "Visitors · admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  if (!analyticsEnabled) notFound();
  return <AdminDashboard />;
}
