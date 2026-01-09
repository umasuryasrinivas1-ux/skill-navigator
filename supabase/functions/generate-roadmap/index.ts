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
1. The roadmap MUST strictly follow this exact structure of Modules (phases) and Topics (skills) WITH THE EXACT RESOURCES PROVIDED. Do NOT deviate or add other high-level phases.
   
   MODULE 1: Frontend (Basics)
   - JavaScript Basics (Variables, Data Types, Functions): Core scripting concepts used to add logic and interactivity to web pages.
     Resources: ["YouTube: JavaScript Tutorial for Beginners - Programming with Mosh", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"]
   - Basic Git and GitHub: Version control tools to track code changes and collaborate with teams.
     Resources: ["YouTube: Git and GitHub for Beginners - freeCodeCamp", "https://docs.github.com/en/get-started"]
   - HTML: Markup language used to structure content on the web.
     Resources: ["YouTube: HTML Full Course - freeCodeCamp", "https://developer.mozilla.org/en-US/docs/Learn/HTML"]
   - CSS: Styling language used to design layouts, colors, and responsiveness of web pages.
     Resources: ["YouTube: CSS Tutorial - Full Course for Beginners - freeCodeCamp", "https://developer.mozilla.org/en-US/docs/Web/CSS"]

   MODULE 2: Backend
   - Advanced JavaScript (DOM Manipulation, Async JS, ES6+): Modern JavaScript features for handling dynamic behavior and asynchronous operations.
     Resources: ["YouTube: JavaScript ES6 Tutorial - The Net Ninja", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference"]
   - React.js Fundamentals (Components, Props, State): Component-based UI library concepts for building interactive frontend applications.
     Resources: ["YouTube: React Course - Beginner's Tutorial - freeCodeCamp", "https://react.dev/learn"]
   - Node.js and npm Basics: JavaScript runtime and package manager for building and managing backend services.
     Resources: ["YouTube: Node.js Tutorial for Beginners - Programming with Mosh", "https://nodejs.org/en/docs/guides"]
   - RESTful APIs (Understanding & Consuming): Standardized way to expose and interact with backend data over HTTP.
     Resources: ["YouTube: REST API Tutorial - freeCodeCamp", "https://restfulapi.net/"]

   MODULE 3: Database / Backend Infrastructure
   - Express.js (Building REST APIs): Lightweight Node.js framework for creating backend APIs and routes.
     Resources: ["YouTube: Express.js Tutorial - Traversy Media", "https://expressjs.com/en/starter/installing.html"]
   - SQL Databases (e.g., PostgreSQL/MySQL): Structured databases used to store and manage relational data.
     Resources: ["YouTube: PostgreSQL Tutorial for Beginners - freeCodeCamp", "https://www.postgresql.org/docs/current/tutorial.html"]
   - Database Integration with ORMs (e.g., Sequelize/Prisma): Tools that simplify database operations using JavaScript objects instead of raw SQL.
     Resources: ["YouTube: Prisma Tutorial - The Net Ninja", "https://www.prisma.io/docs/getting-started"]
   - Authentication & Authorization (e.g., JWT): Mechanisms to verify user identity and control access to resources.
     Resources: ["YouTube: JWT Authentication Tutorial - Web Dev Simplified", "https://jwt.io/introduction"]
   - Deployment Basics (e.g., Heroku, Netlify, Vercel): Processes and platforms used to host and run applications in production.
     Resources: ["YouTube: Deploy Full Stack App - Traversy Media", "https://vercel.com/docs"]

2. Output Structure:
   - Map "Modules" (Frontend (Basics), Backend, Database / Backend Infrastructure) to "phases" in JSON.
   - Map the underlying concepts to "skills" in JSON.
   - For each "skill" (Topic), use the provided DESCRIPTION and RESOURCES exactly as listed above.

3. Each Topic (skill) must have:
   - Name: The topic name from the list above.
   - Description: The exact description provided in the list above.
   - Days: Time allocation. Distribute the total ${targetDuration} days intelligently across these topics based on complexity.
   - Resources: Use the EXACT resources provided for each topic above. Format as an array of two strings.

4. The TOTAL DURATION of all modules combined MUST be exactly ${targetDuration} days.

Format response as JSON:
{
  "phases": [
    {
      "name": "Frontend (Basics)",
      "duration_days": 10,
      "description": "Core scripting and structure.",
      "skills": [
        {
          "name": "JavaScript Basics",
          "days": "Day 1-3",
          "description": "Core scripting concepts used to add logic and interactivity to web pages.",
          "resources": ["YouTube: JavaScript Tutorial for Beginners - Programming with Mosh", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"]
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
