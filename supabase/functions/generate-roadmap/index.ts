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
    const targetDuration = context?.target_duration || 30; // 30, 60, 90, 180
    const expLevel = context?.level || educationLevel;
    const expDetail = context?.background || "";
    const goal = context?.goal || "";

    const systemPrompt = `You are a Senior Technical Instructor. Create a strict, no-fluff learning syllabus for Full-Stack Development.

RULES:
1. Structure the content into logical "Modules" (mapped to "phases" in the JSON output). Do NOT use level labels like "Beginner" or "Advanced". Just technical progression (e.g., "Frontend Fundamentals", "Backend Architecture").
2. Inside each module, list specific "Topics" (mapped to "skills" in JSON).
3. Each Topic must have:
   - Name: Technical topic name (e.g., "React Hooks", "PostgreSQL Indexing").
   - Description: A single, concise line explaining what to learn/build.
   - Days: Time allocation strictly fitting the schedule (e.g., "Day 1-2").
   - Resources: Provide exactly TWO resources:
     1. One specific YouTube video title or search query.
     2. One Official Documentation URL.
4. The TOTAL DURATION of all modules combined MUST be exactly ${targetDuration} days.
5. Tailor the pacing to a ${dailyTime} hour/day schedule.

Format response as JSON:
{
  "phases": [
    {
      "name": "Module Name",
      "duration_days": 10,
      "description": "Output of this module",
      "skills": [
        {
          "name": "Topic Name",
          "days": "Day 1-3",
          "description": "One line description.",
          "resources": ["YouTube: Title", "Docs: URL"]
        }
      ]
    }
  ]
}`;

    const userPrompt = `User Profile:
- Current Experience: ${expLevel} (${expDetail})
- Goal: ${goal}
- Target Duration: ${targetDuration} days

Generate the syllabus now. Keep it technical, direct, and actionable.`;

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
