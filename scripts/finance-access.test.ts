import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { requireFinanceAccess } from '../convex/lib/requireOwner';

function fakeContext(subject: string | null) {
  return { auth: { getUserIdentity: async () => subject ? { subject } : null } };
}
const original = process.env.FINANCE_ALLOWED_CLERK_USER_IDS;

test('finance access requires explicit allowlist, even with a valid Clerk identity', async () => {
  delete process.env.FINANCE_ALLOWED_CLERK_USER_IDS;
  await assert.rejects(requireFinanceAccess(fakeContext('user_1')), /not configured/);
  process.env.FINANCE_ALLOWED_CLERK_USER_IDS = '';
  await assert.rejects(requireFinanceAccess(fakeContext('user_1')), /not configured/);
});

test('every user from shared Clerk application must be allowlisted', async () => {
  process.env.FINANCE_ALLOWED_CLERK_USER_IDS = ' user_1, user_2 ';
  await requireFinanceAccess(fakeContext('user_1'));
  await requireFinanceAccess(fakeContext('user_2'));
  await assert.rejects(requireFinanceAccess(fakeContext('user_3')), /Unauthorized/);
  await assert.rejects(requireFinanceAccess(fakeContext(null)), /Unauthorized/);
  await assert.rejects(requireFinanceAccess(fakeContext('user_2_extra')), /Unauthorized/);
});

process.on('exit', () => {
  if (original === undefined) delete process.env.FINANCE_ALLOWED_CLERK_USER_IDS;
  else process.env.FINANCE_ALLOWED_CLERK_USER_IDS = original;
});
