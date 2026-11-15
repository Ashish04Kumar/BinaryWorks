"use client";
import { usePathname } from "next/navigation";

// The site's navbar and footer, hidden on the /admin dashboard
const SiteChrome = ({ children }: { children: React.ReactNode }) => (usePathname().startsWith("/admin") ? null : <>{children}</>);

export default SiteChrome;
