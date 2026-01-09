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
    const { userId, educationLevel, existingSkills, targetSkill, weeklyHours } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const systemPrompt = `You are an expert career and learning advisor. Generate a structured skill learning roadmap based on the user's profile.

The roadmap MUST be returned as a JSON object with the following structure:
{
  "phases": [
    {
      "name": "Beginner / Foundation",
      "skills": [
        {
          "name": "Skill Name",
          "estimatedTime": "2 weeks",
          "description": "Brief explanation of why this skill matters and how it connects to the goal",
          "order": 1
        }
      ]
    },
    {
      "name": "Intermediate",
      "skills": [...]
    },
    {
      "name": "Advanced",
      "skills": [...]
    }
  ]
}

Guidelines:
- Each phase should have 3-5 skills
- Skills should be in logical learning order
- Estimated time should be realistic based on weekly hours available
- Descriptions should be 1-2 sentences explaining relevance
- Consider existing skills to avoid redundancy
- Make the path practical and actionable`;

    const userPrompt = `Create a personalized learning roadmap for:

Target Role/Skill: ${targetSkill}
Current Education: ${educationLevel}
Existing Skills: ${existingSkills.length > 0 ? existingSkills.join(", ") : "None specified"}
Weekly Learning Time: ${weeklyHours} hours

Generate a comprehensive roadmap with skills ordered from foundational to advanced. Ensure time estimates are realistic for ${weeklyHours} hours per week of study.`;

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
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate roadmap");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let roadmapData;
    try {
      roadmapData = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid roadmap format");
    }

    // Validate the structure
    if (!roadmapData.phases || !Array.isArray(roadmapData.phases)) {
      throw new Error("Invalid roadmap structure");
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
