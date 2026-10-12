/** Access to shared household finances for explicitly authorized Clerk users.
 *
 * Clerk establishes identity; this separate allowlist establishes authorization.
 * Reuse Ultimate Shopper's *production Clerk instance*, not its Convex deployment.
 */
type AuthContext = { auth: { getUserIdentity(): Promise<{ subject: string } | null> } };

export async function requireFinanceAccess(ctx: AuthContext): Promise<void> {
  const configured = process.env.FINANCE_ALLOWED_CLERK_USER_IDS;
  // Never grant access to every Clerk account if the allowlist is missing.
  const allowed = new Set((configured ?? '').split(',').map((id) => id.trim()).filter(Boolean));
  if (allowed.size === 0) throw new Error('Financial data access is not configured');
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !allowed.has(identity.subject)) throw new Error('Unauthorized');
}
