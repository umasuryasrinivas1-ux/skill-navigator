import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, educationLevel, existingSkills, targetSkill, weeklyHours, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Context Extraction
    const dailyTime = context?.daily_time || (weeklyHours / 7);
    const targetDuration = context?.target_duration || 30;
    const expLevel = context?.level || educationLevel;
    const expDetail = context?.background || "";
    const goal = context?.goal || "";

    const systemPrompt = `You are a Senior Technical Instructor. Create a strict, no-fluff learning syllabus for ${targetSkill} WITH QUIZ QUESTIONS FOR EACH TOPIC.
    
    RULES:
    1. The roadmap MUST follow a structured approach with 3 MAIN MODULES (Phases):
       - Phase 1: Foundation / Basics
       - Phase 2: Intermediate / Core Concepts
       - Phase 3: Advanced / Professional Mastery
    
    2. For EACH Phase, generate 4-5 key Technical Topics (Skills) that are essential for ${targetSkill}.
    
    3. For EACH Topic (skill), you MUST generate:
       - Name: The technical topic name.
       - Description: A clear, high-quality technical description.
       - Days: "Day X-Y" time allocation based on complexity.
       - Resources: EXACTLY 2 high-quality learning resources:
         * One MUST be a specific YouTube video title (format: "YouTube: [Video Title] - [Channel Name]").
         * One MUST be a specific official documentation or high-quality article URL.
       - Quiz: EXACTLY 3 multiple choice questions to test understanding:
         * question: The question text.
         * options: Array of 4 possible answers.
         * correctAnswer: Index (0-3) of the correct answer.
    
    4. The TOTAL DURATION of all modules combined MUST be exactly ${targetDuration} days. Distribute days intelligently.
    
    5. Output STRICT JSON format:
    {
      "phases": [
        {
          "name": "Phase Name",
          "description": "Phase Description",
          "skills": [
            {
              "name": "Skill Name",
              "description": "...",
              "days": "Day X-Y",
              "resources": ["YouTube: ...", "https://..."],
              "quiz": [
                 { "question": "...", "options": ["..."], "correctAnswer": 0 }
              ]
            }
          ]
        }
      ]
    }`;

    const userPrompt = `User Profile:
- Current Experience: ${expLevel} (${expDetail})
- Goal: ${goal}
- Target Duration: ${targetDuration} days

Generate the syllabus now with quiz questions for each topic. Keep it technical, direct, and actionable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate roadmap");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    let roadmapData;
    try {
      roadmapData = JSON.parse(content);
    } catch {
      throw new Error("Invalid roadmap format");
    }

    // Save roadmap to database
    const { data: savedRoadmap, error: saveError } = await supabase
      .from("skill_roadmaps")
      .insert({
        user_id: userId,
        target_skill: targetSkill,
        roadmap_data: roadmapData,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving roadmap:", saveError);
      throw new Error("Failed to save roadmap");
    }

    return new Response(JSON.stringify({ success: true, roadmap: savedRoadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-roadmap error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
