import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getMealsByDate,
  createMeal,
  updateMeal,
  deleteMeal,
  getDailyTracking,
  upsertDailyTracking,
  getCoachingLogs,
  addCoachingLog,
} from "./db";
import { calculateBMR, calculateTDEE, calculateMacroTargets, generateCoachingTips } from "./macroCalculations";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getUserProfile(ctx.user.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          goal: z.enum(["bulk", "lose", "lean"]),
          age: z.number().int().positive(),
          gender: z.enum(["male", "female", "other"]),
          height: z.number().positive(),
          weight: z.number().positive(),
          activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
          timezone: z.string().default("UTC"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const bmr = calculateBMR(input.weight, input.height, input.age, input.gender);
        const tdee = calculateTDEE(bmr, input.activityLevel);
        const macros = calculateMacroTargets(tdee, input.goal);

        await createUserProfile(ctx.user.id, {
          goal: input.goal,
          age: input.age,
          gender: input.gender,
          height: input.height as any,
          weight: input.weight as any,
          activityLevel: input.activityLevel,
          targetCalories: macros.targetCalories,
          targetProtein: macros.targetProtein as any,
          targetCarbs: macros.targetCarbs as any,
          targetFat: macros.targetFat as any,
          timezone: input.timezone,
          onboardingComplete: true,
        } as any);

        return { success: true, macros };
      }),

    update: protectedProcedure
      .input(
        z.object({
          goal: z.enum(["bulk", "lose", "lean"]).optional(),
          age: z.number().int().positive().optional(),
          gender: z.enum(["male", "female", "other"]).optional(),
          height: z.number().positive().optional(),
          weight: z.number().positive().optional(),
          activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
          timezone: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getUserProfile(ctx.user.id);
        if (!profile) throw new Error("Profile not found");

        const height = input.height ?? Number(profile.height);
        const weight = input.weight ?? Number(profile.weight);
        const age = input.age ?? profile.age;
        const gender = input.gender ?? profile.gender;
        const activityLevel = input.activityLevel ?? profile.activityLevel;
        const goal = input.goal ?? profile.goal;

        let updateData: any = { ...input };

        if (height && weight && age && gender && activityLevel && goal) {
          const bmr = calculateBMR(weight, height, age, gender);
          const tdee = calculateTDEE(bmr, activityLevel);
          const macros = calculateMacroTargets(tdee, goal);

          updateData = {
            ...updateData,
            targetCalories: macros.targetCalories,
            targetProtein: macros.targetProtein,
            targetCarbs: macros.targetCarbs,
            targetFat: macros.targetFat,
          };
        }

        await updateUserProfile(ctx.user.id, updateData);
        return { success: true };
      }),
  }),

  meals: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      return await getMealsByDate(ctx.user.id, today);
    }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        return await getMealsByDate(ctx.user.id, input.date);
      }),

    create: protectedProcedure
      .input(
        z.object({
          mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]),
          name: z.string(),
          description: z.string().optional(),
          calories: z.number().int().positive(),
          protein: z.number().positive(),
          carbs: z.number().positive(),
          fat: z.number().positive(),
          imageUrl: z.string().optional(),
          aiEstimated: z.boolean().default(false),
          mealDate: z.date().default(() => new Date()),
          mealTime: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const dateStr = input.mealDate.toISOString().split("T")[0];
        await createMeal({
          userId: ctx.user.id,
          mealType: input.mealType,
          name: input.name,
          description: input.description,
          calories: input.calories,
          protein: input.protein as any,
          carbs: input.carbs as any,
          fat: input.fat as any,
          imageUrl: input.imageUrl,
          aiEstimated: input.aiEstimated,
          mealDate: dateStr as any,
          mealTime: input.mealTime,
        });

        await updateDailyTracking(ctx.user.id, input.mealDate, input);

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          mealId: z.number(),
          mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]).optional(),
          name: z.string().optional(),
          description: z.string().optional(),
          calories: z.number().int().positive().optional(),
          protein: z.number().positive().optional(),
          carbs: z.number().positive().optional(),
          fat: z.number().positive().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { mealId, ...updateData } = input;
        await updateMeal(mealId, updateData as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ mealId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteMeal(input.mealId);
        return { success: true };
      }),
  }),

  tracking: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      const tracking = await getDailyTracking(ctx.user.id, today);
      const profile = await getUserProfile(ctx.user.id);

      return {
        tracking,
        profile,
      };
    }),

    getByDate: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        const tracking = await getDailyTracking(ctx.user.id, input.date);
        const profile = await getUserProfile(ctx.user.id);

        return {
          tracking,
          profile,
        };
      }),
  }),

  mealAnalysis: router({
    analyzeFromImage: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { analyzeMealFromImage } = await import("./mealAnalysis");
        const analysis = await analyzeMealFromImage(input.imageUrl, input.description);
        return analysis;
      }),

    analyzeFromDescription: protectedProcedure
      .input(z.object({ description: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { analyzeMealFromDescription } = await import("./mealAnalysis");
        const analysis = await analyzeMealFromDescription(input.description);
        return analysis;
      }),

    refineEstimate: protectedProcedure
      .input(
        z.object({
          originalAnalysis: z.object({
            mealName: z.string(),
            description: z.string(),
            calories: z.number(),
            protein: z.number(),
            carbs: z.number(),
            fat: z.number(),
            confidence: z.enum(["high", "medium", "low"]),
            ingredients: z.array(z.string()),
            notes: z.string(),
          }),
          userFeedback: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { refineMealEstimate } = await import("./mealAnalysis");
        const refined = await refineMealEstimate(input.originalAnalysis, input.userFeedback);
        return refined;
      }),
  }),

  coaching: router({
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      const profile = await getUserProfile(ctx.user.id);
      const tracking = await getDailyTracking(ctx.user.id, today);
      const existingTips = await getCoachingLogs(ctx.user.id, today);

      if (existingTips.length > 0) {
        return existingTips;
      }

      if (!profile || !tracking) {
        return [];
      }

      const tips = generateCoachingTips(
        tracking.totalCalories || 0,
        profile.targetCalories || 2000,
        Number(tracking.totalProtein) || 0,
        Number(profile.targetProtein) || 150,
        Number(tracking.totalCarbs) || 0,
        Number(profile.targetCarbs) || 200,
        Number(tracking.totalFat) || 0,
        Number(profile.targetFat) || 65,
        profile.goal
      );

      for (const tip of tips) {
        await addCoachingLog(ctx.user.id, today, tip.tip, tip.category);
      }

      return tips;
    }),
  }),
});

/**
 * Helper to update daily tracking totals
 */
async function updateDailyTracking(
  userId: number,
  mealDate: Date,
  mealData: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
) {
  const meals = await getMealsByDate(userId, mealDate);
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + Number(meal.protein), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + Number(meal.carbs), 0);
  const totalFat = meals.reduce((sum, meal) => sum + Number(meal.fat), 0);

  await upsertDailyTracking(userId, mealDate, {
    totalCalories,
    totalProtein: totalProtein as any,
    totalCarbs: totalCarbs as any,
    totalFat: totalFat as any,
    mealCount: meals.length,
  });
}

export type AppRouter = typeof appRouter;
