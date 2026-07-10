// The ONLY emails allowed to hold the "admin" role on this platform.
// Enforced in 3 places for defense-in-depth:
//   1. AuthContext — auto-assigns/self-heals role:"admin" for these emails
//      on every login, and never assigns "admin" to anyone else.
//   2. src/app/dashboard/admin/page.tsx — redirects away anyone whose email
//      isn't in this list, even if their Firestore `role` field somehow
//      says "admin" (belt-and-suspenders in case rules/data get tampered).
//   3. firestore.rules — server-side enforcement: the `role` field on a
//      `users/{uid}` doc can only be set to "admin" if the request is made
//      by one of these emails. This is the layer that actually matters;
//      1 and 2 are just UX/defense-in-depth on top of it.
//
// To change who has admin access, edit this list AND redeploy
// firestore.rules (see comment at the top of that file).

export const ALLOWED_ADMIN_EMAILS: string[] = [
  "bhatt.yogesh0814@gmail.com",
  "ypranjalt@gmail.com",
  "nikhil2005114@gmail.com",
];

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
