/** Fail-closed single-owner authorization for private financial records. */
import type { GenericActionCtx, GenericMutationCtx, GenericQueryCtx, DataModelFromSchemaDefinition } from 'convex/server';

type AuthContext = { auth: { getUserIdentity(): Promise<{ subject: string } | null> } };

export async function requireOwner(ctx: AuthContext): Promise<void> {
  const owner = process.env.OWNER_CLERK_USER_ID;
  if (!owner) throw new Error('OWNER_CLERK_USER_ID is not configured');
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || identity.subject !== owner) {
    throw new Error('Unauthorized');
  }
}
