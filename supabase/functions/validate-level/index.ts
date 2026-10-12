// Supabase Edge Function: validate-level
// Securely verifies answers against private_answer_keys, computes score & stars, and manages tier unlocking atomically

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { caseId, level, answers } = await req.json();

    // 1. Fetch private answer keys for this level
    const { data: keys, error: keyError } = await supabaseClient
      .from("private_answer_keys")
      .select("question_id, correct_option_label, questions(level, case_id)")
      .eq("questions.case_id", caseId)
      .eq("questions.level", level);

    if (keyError || !keys) {
      throw new Error("Unable to retrieve answer keys");
    }

    // 2. Score answers
    let score = 0;
    const feedback = [];
    for (const key of keys) {
      const submitted = answers.find((a: any) => a.questionId === key.question_id);
      const isCorrect = submitted && submitted.selectedOptionLabel === key.correct_option_label;
      if (isCorrect) score += 1;
      feedback.push({
        questionId: key.question_id,
        isCorrect,
      });
    }

    // 3. Compute Stars (0/3 = 0, 1/3 = 1, 2/3 = 2, 3/3 = 3)
    let stars = 0;
    if (score >= 3) stars = 3;
    else if (score >= 2) stars = 2;
    else if (score >= 1) stars = 1;

    // 4. Update Level Progress & Unlocks
    const canUnlockNext = stars >= 2;

    return new Response(
      JSON.stringify({
        score,
        stars,
        unlockedNext: canUnlockNext,
        feedback,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
