// One switch for visitor analytics and the /admin dashboard. Off unless NEXT_PUBLIC_ANALYTICS_ENABLED=true.
// Off: nothing is tracked or logged, and /admin and its APIs answer 404.
// NEXT_PUBLIC_ so the browser tracker sees it too (it is baked in at build time: redeploy after changing it).
export const analyticsEnabled = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
