/**
 * Macro calculations and fitness logic
 */

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "bulk" | "lose" | "lean";
export type Gender = "male" | "female" | "other";

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * @param weight in kg
 * @param height in cm
 * @param age in years
 * @param gender male or female
 */
export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param bmr Basal Metabolic Rate
 * @param activityLevel Activity level multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * multipliers[activityLevel]);
}

/**
 * Calculate macro targets based on goal and TDEE
 */
export function calculateMacroTargets(tdee: number, goal: Goal) {
  let calorieAdjustment = 0;
  let proteinRatio = 0.3;
  let carbRatio = 0.4;
  let fatRatio = 0.3;

  switch (goal) {
    case "bulk":
      calorieAdjustment = 300;
      proteinRatio = 0.3;
      carbRatio = 0.45;
      fatRatio = 0.25;
      break;
    case "lose":
      calorieAdjustment = -400;
      proteinRatio = 0.35;
      carbRatio = 0.35;
      fatRatio = 0.3;
      break;
    case "lean":
      calorieAdjustment = -200;
      proteinRatio = 0.32;
      carbRatio = 0.42;
      fatRatio = 0.26;
      break;
  }

  const targetCalories = tdee + calorieAdjustment;
  const targetProtein = Math.round((targetCalories * proteinRatio) / 4);
  const targetCarbs = Math.round((targetCalories * carbRatio) / 4);
  const targetFat = Math.round((targetCalories * fatRatio) / 9);

  return {
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
  };
}

/**
 * Generate coaching tips based on macro adherence
 */
export function generateCoachingTips(
  totalCalories: number,
  targetCalories: number,
  totalProtein: number,
  targetProtein: number,
  totalCarbs: number,
  targetCarbs: number,
  totalFat: number,
  targetFat: number,
  goal: Goal
): Array<{ tip: string; category: string }> {
  const tips: Array<{ tip: string; category: string }> = [];

  const caloriePercentage = (totalCalories / targetCalories) * 100;
  const proteinPercentage = (totalProtein / targetProtein) * 100;
  const carbsPercentage = (totalCarbs / targetCarbs) * 100;
  const fatPercentage = (totalFat / targetFat) * 100;

  if (caloriePercentage < 80) {
    tips.push({
      tip: `You're ${Math.round(100 - caloriePercentage)}% under your calorie target. Consider adding a snack to reach your goal.`,
      category: "calories",
    });
  } else if (caloriePercentage > 110) {
    tips.push({
      tip: `You've exceeded your calorie target by ${Math.round(caloriePercentage - 100)}%. Be mindful of portion sizes for your next meal.`,
      category: "calories",
    });
  }

  if (proteinPercentage < 80) {
    tips.push({
      tip: `Your protein intake is ${Math.round(80 - proteinPercentage)}% below target. Add lean protein like chicken, fish, or Greek yogurt.`,
      category: "protein",
    });
  } else if (proteinPercentage > 110) {
    tips.push({
      tip: "Great job on protein! You're exceeding your target.",
      category: "protein",
    });
  }

  if (carbsPercentage < 80) {
    tips.push({
      tip: "Your carbs are running low. Consider adding rice, pasta, or whole grains to your meals.",
      category: "carbs",
    });
  } else if (carbsPercentage > 110) {
    tips.push({
      tip: "You're high on carbs. Balance with more protein and vegetables for your next meal.",
      category: "carbs",
    });
  }

  if (fatPercentage < 80) {
    tips.push({
      tip: "Your fat intake is below target. Add healthy fats like avocado, nuts, or olive oil.",
      category: "fat",
    });
  } else if (fatPercentage > 110) {
    tips.push({
      tip: "You're high on fats. Choose leaner protein sources for your next meal.",
      category: "fat",
    });
  }

  if (caloriePercentage >= 90 && caloriePercentage <= 110) {
    if (goal === "bulk") {
      tips.push({
        tip: "Perfect calorie intake for muscle building! Keep up the consistent eating.",
        category: "motivation",
      });
    } else if (goal === "lose") {
      tips.push({
        tip: "Excellent calorie deficit maintained. Stay consistent for best results!",
        category: "motivation",
      });
    } else {
      tips.push({
        tip: "You're right on track with your lean gains goal. Great work!",
        category: "motivation",
      });
    }
  }

  return tips.length > 0 ? tips : [{ tip: "Keep tracking your meals for better insights!", category: "general" }];
}

/**
 * Calculate macro percentages
 */
export function calculateMacroPercentages(
  calories: number,
  protein: number,
  carbs: number,
  fat: number
) {
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;

  return {
    proteinPercent: Math.round((proteinCals / calories) * 100) || 0,
    carbsPercent: Math.round((carbsCals / calories) * 100) || 0,
    fatPercent: Math.round((fatCals / calories) * 100) || 0,
  };
}
