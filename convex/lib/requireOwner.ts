/** Fail-closed authorization for this single-owner personal finance deployment. */
type AuthContext = { auth: { getUserIdentity(): Promise<{ subject: string } | null> } };
export async function requireOwner(ctx: AuthContext): Promise<void> {
  const owner = process.env.OWNER_CLERK_USER_ID;
  if (!owner) throw new Error('OWNER_CLERK_USER_ID is not configured');
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== owner) throw new Error('Unauthorized');
}
