import { requireOwner } from "./lib/requireOwner";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    return await ctx.db
      .query("statements")
      .withIndex("by_period")
      .collect();
  },
});

export const byPeriod = query({
  args: { period: v.string() },
  handler: async (ctx, { period }) => {
    await requireOwner(ctx);
    return await ctx.db
      .query("statements")
      .withIndex("by_period", (q) => q.eq("period", period))
      .first();
  },
});

export const upsert = mutation({
  args: {
    period: v.string(),
    accountNumber: v.string(),
    openingBalance: v.number(),
    closingBalance: v.number(),
    totalIncome: v.number(),
    totalDebits: v.number(),
  },
  handler: async (ctx, args) => {
    await requireOwner(ctx);
    const existing = await ctx.db
      .query("statements")
      .withIndex("by_period", (q) => q.eq("period", args.period))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("statements", args);
    }
  },
});
