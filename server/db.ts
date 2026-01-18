import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InsertUser, users, userProfiles, meals, dailyTracking, coachingLogs, InsertUserProfile, InsertMeal, InsertDailyTracking } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get or create user profile
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserProfile(userId: number, data: InsertUserProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const profile = { ...data, userId };
  await db.insert(userProfiles).values(profile);
  return profile;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(userProfiles).set(data).where(eq(userProfiles.userId, userId));
}

/**
 * Meal operations
 */
export async function getMealsByDate(userId: number, mealDate: Date) {
  const db = await getDb();
  if (!db) return [];

  const dateStr = mealDate.toISOString().split('T')[0];
  const result = await db.select().from(meals).where(
    and(eq(meals.userId, userId), eq(meals.mealDate, dateStr as any))
  );
  return result;
}

export async function createMeal(mealData: InsertMeal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(meals).values(mealData);
  return result;
}

export async function updateMeal(mealId: number, data: Partial<InsertMeal>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(meals).set(data).where(eq(meals.id, mealId));
}

export async function deleteMeal(mealId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(meals).where(eq(meals.id, mealId));
}

/**
 * Daily tracking operations
 */
export async function getDailyTracking(userId: number, trackingDate: Date) {
  const db = await getDb();
  if (!db) return undefined;

  const dateStr = trackingDate.toISOString().split('T')[0];
  const result = await db.select().from(dailyTracking).where(
    and(eq(dailyTracking.userId, userId), eq(dailyTracking.trackingDate, dateStr as any))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertDailyTracking(userId: number, trackingDate: Date, data: Partial<InsertDailyTracking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dateStr = trackingDate.toISOString().split('T')[0];
  const existing = await getDailyTracking(userId, trackingDate);

  if (existing) {
    await db.update(dailyTracking).set(data).where(
      and(eq(dailyTracking.userId, userId), eq(dailyTracking.trackingDate, dateStr as any))
    );
  } else {
    await db.insert(dailyTracking).values({
      userId,
      trackingDate: dateStr as any,
      ...data,
    });
  }
}

/**
 * Coaching logs
 */
export async function addCoachingLog(userId: number, coachingDate: Date, tip: string, category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dateStr = coachingDate.toISOString().split('T')[0];
  await db.insert(coachingLogs).values({
    userId,
    coachingDate: dateStr as any,
    tip,
    category: category as any,
  });
}

export async function getCoachingLogs(userId: number, coachingDate: Date) {
  const db = await getDb();
  if (!db) return [];

  const dateStr = coachingDate.toISOString().split('T')[0];
  const result = await db.select().from(coachingLogs).where(
    and(eq(coachingLogs.userId, userId), eq(coachingLogs.coachingDate, dateStr as any))
  );
  return result;
}
