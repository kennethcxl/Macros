import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, date, boolean, serial } from "drizzle-orm/pg-core";

// Define enums for PostgreSQL
const roleEnum = pgEnum("role", ["user", "admin"]);
const goalEnum = pgEnum("goal", ["bulk", "lose", "lean"]);
const genderEnum = pgEnum("gender", ["male", "female", "other"]);
const activityLevelEnum = pgEnum("activity_level", ["sedentary", "light", "moderate", "active", "very_active"]);
const mealTypeEnum = pgEnum("meal_type", ["breakfast", "lunch", "dinner", "snack", "other"]);
const categoryEnum = pgEnum("category", ["protein", "carbs", "fat", "calories", "motivation", "general"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Supabase Auth UUID or custom openId. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profile table storing fitness goals and body metrics
 */
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  goal: goalEnum("goal").notNull(),
  age: integer("age"),
  gender: genderEnum("gender"),
  height: decimal("height", { precision: 5, scale: 2 }),
  weight: decimal("weight", { precision: 6, scale: 2 }),
  activityLevel: activityLevelEnum("activity_level"),
  targetCalories: integer("target_calories"),
  targetProtein: decimal("target_protein", { precision: 6, scale: 2 }),
  targetCarbs: decimal("target_carbs", { precision: 6, scale: 2 }),
  targetFat: decimal("target_fat", { precision: 6, scale: 2 }),
  timezone: varchar("timezone", { length: 64 }).default("UTC"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Meals table storing individual meal entries
 */
export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  mealType: mealTypeEnum("meal_type"),
  name: text("name"),
  description: text("description"),
  calories: integer("calories").notNull(),
  protein: decimal("protein", { precision: 6, scale: 2 }).notNull(),
  carbs: decimal("carbs", { precision: 6, scale: 2 }).notNull(),
  fat: decimal("fat", { precision: 6, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  aiEstimated: boolean("ai_estimated").default(false),
  mealDate: date("meal_date").notNull(),
  mealTime: varchar("meal_time", { length: 5 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Meal = typeof meals.$inferSelect;
export type InsertMeal = typeof meals.$inferInsert;

/**
 * Daily tracking table storing aggregated daily macro data
 */
export const dailyTracking = pgTable("daily_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  trackingDate: date("tracking_date").notNull(),
  totalCalories: integer("total_calories").default(0),
  totalProtein: decimal("total_protein", { precision: 6, scale: 2 }).default("0"),
  totalCarbs: decimal("total_carbs", { precision: 6, scale: 2 }).default("0"),
  totalFat: decimal("total_fat", { precision: 6, scale: 2 }).default("0"),
  mealCount: integer("meal_count").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DailyTracking = typeof dailyTracking.$inferSelect;
export type InsertDailyTracking = typeof dailyTracking.$inferInsert;

/**
 * Coaching logs table storing AI-generated coaching tips
 */
export const coachingLogs = pgTable("coaching_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  coachingDate: date("coaching_date").notNull(),
  tip: text("tip"),
  category: categoryEnum("category"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoachingLog = typeof coachingLogs.$inferSelect;
export type InsertCoachingLog = typeof coachingLogs.$inferInsert;