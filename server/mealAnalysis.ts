import { invokeLLM } from "./_core/llm";

export interface MealAnalysisResult {
  mealName: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: "high" | "medium" | "low";
  ingredients: string[];
  notes: string;
}

/**
 * Analyze a meal from an image URL or text description
 * Uses OpenRouter LLM with vision capabilities to estimate macros
 */
export async function analyzeMealFromImage(imageUrl: string, userDescription?: string): Promise<MealAnalysisResult> {
  const prompt = `You are a professional nutritionist and food analyst. Analyze this meal image and provide accurate macro estimates.

${userDescription ? `User notes: ${userDescription}` : ""}

Please analyze the meal and provide:
1. Meal name
2. Detailed description of what you see
3. Estimated calories
4. Estimated protein (grams)
5. Estimated carbs (grams)
6. Estimated fat (grams)
7. List of ingredients you can identify
8. Your confidence level (high/medium/low)
9. Any notes about portion size or assumptions

Format your response as JSON with these exact keys:
{
  "mealName": "string",
  "description": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": "high" | "medium" | "low",
  "ingredients": ["string"],
  "notes": "string"
}

Be as accurate as possible. If you cannot see the image clearly, set confidence to "low" and explain in notes.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high",
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mealName: { type: "string", description: "Name of the meal" },
            description: { type: "string", description: "Detailed description of the meal" },
            calories: { type: "number", description: "Estimated calories" },
            protein: { type: "number", description: "Estimated protein in grams" },
            carbs: { type: "number", description: "Estimated carbs in grams" },
            fat: { type: "number", description: "Estimated fat in grams" },
            confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level of estimation" },
            ingredients: { type: "array", items: { type: "string" }, description: "List of identified ingredients" },
            notes: { type: "string", description: "Additional notes and assumptions" },
          },
          required: ["mealName", "description", "calories", "protein", "carbs", "fat", "confidence", "ingredients", "notes"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(content);
  return parsed as MealAnalysisResult;
}

/**
 * Analyze a meal from text description only
 * For when user describes their meal instead of uploading an image
 */
export async function analyzeMealFromDescription(mealDescription: string): Promise<MealAnalysisResult> {
  const prompt = `You are a professional nutritionist and food analyst. A user has described their meal. Provide accurate macro estimates based on their description.

User's meal description: "${mealDescription}"

Please analyze and provide:
1. Meal name (infer from description)
2. Detailed analysis of what they likely ate
3. Estimated calories
4. Estimated protein (grams)
5. Estimated carbs (grams)
6. Estimated fat (grams)
7. List of likely ingredients
8. Your confidence level (high/medium/low)
9. Any notes about assumptions or portion size

Format your response as JSON with these exact keys:
{
  "mealName": "string",
  "description": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": "high" | "medium" | "low",
  "ingredients": ["string"],
  "notes": "string"
}

Be as accurate as possible based on typical portion sizes. If the description is vague, set confidence to "medium" and explain assumptions in notes.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a professional nutritionist providing accurate macro estimates for meals described by users.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mealName: { type: "string", description: "Name of the meal" },
            description: { type: "string", description: "Detailed analysis of the meal" },
            calories: { type: "number", description: "Estimated calories" },
            protein: { type: "number", description: "Estimated protein in grams" },
            carbs: { type: "number", description: "Estimated carbs in grams" },
            fat: { type: "number", description: "Estimated fat in grams" },
            confidence: { type: "string", enum: ["high", "medium", "low"], description: "Confidence level of estimation" },
            ingredients: { type: "array", items: { type: "string" }, description: "List of likely ingredients" },
            notes: { type: "string", description: "Additional notes and assumptions" },
          },
          required: ["mealName", "description", "calories", "protein", "carbs", "fat", "confidence", "ingredients", "notes"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(content);
  return parsed as MealAnalysisResult;
}

/**
 * Refine macro estimates based on user feedback
 * User can adjust portion size or provide additional details
 */
export async function refineMealEstimate(
  originalAnalysis: MealAnalysisResult,
  userFeedback: string
): Promise<MealAnalysisResult> {
  const prompt = `You are a professional nutritionist. A user has provided feedback on a meal analysis. Please refine the macro estimates based on their feedback.

Original analysis:
- Meal: ${originalAnalysis.mealName}
- Calories: ${originalAnalysis.calories}
- Protein: ${originalAnalysis.protein}g
- Carbs: ${originalAnalysis.carbs}g
- Fat: ${originalAnalysis.fat}g
- Confidence: ${originalAnalysis.confidence}

User feedback: "${userFeedback}"

Please provide refined estimates as JSON:
{
  "mealName": "string",
  "description": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "confidence": "high" | "medium" | "low",
  "ingredients": ["string"],
  "notes": "string"
}`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a professional nutritionist providing refined macro estimates based on user feedback.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "meal_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            mealName: { type: "string" },
            description: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            ingredients: { type: "array", items: { type: "string" } },
            notes: { type: "string" },
          },
          required: ["mealName", "description", "calories", "protein", "carbs", "fat", "confidence", "ingredients", "notes"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message.content;
  if (!content || typeof content !== "string") {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(content);
  return parsed as MealAnalysisResult;
}
