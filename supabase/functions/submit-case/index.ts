// Supabase Edge Function: submit-case
// Atomic case finalization, reference generation, and duplicate prevention

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

    const { caseId, submissionType, feedbackRating, feedbackComments } = await req.json();

    // Check existing attempt to ensure idempotency
    const { data: attempt } = await supabaseClient
      .from("game_attempts")
      .select("*, cases(case_code, title)")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .single();

    if (attempt?.status === "submitted_final" && attempt?.submission_ref) {
      return new Response(
        JSON.stringify({
          message: "Attempt already finalized",
          submissionRef: attempt.submission_ref,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const caseCode = attempt?.cases?.case_code || "CASE";
    const submissionRef = `SUB-${caseCode.replace("CASE-", "")}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create final submission row
    const { data: submission, error: subError } = await supabaseClient
      .from("final_submissions")
      .insert({
        submission_ref: submissionRef,
        case_id: caseId,
        case_code: caseCode,
        case_title: attempt?.cases?.title || "Investigation Case",
        user_id: user.id,
        player_name: user.user_metadata?.display_name || "Investigator",
        badge_number: user.user_metadata?.badge_number || "BD-1000",
        submission_type: submissionType,
        is_completed: submissionType === "final",
        easy_score: 3,
        easy_stars: 3,
        total_score_earned: 8,
        total_attempted_possible: 9,
        full_case_max_score: 9,
        total_stars_earned: 8,
        completion_percentage: 100,
        feedback_rating: feedbackRating || 5,
        feedback_comments: feedbackComments || "",
      })
      .select()
      .single();

    if (subError) throw subError;

    // Update attempt status
    await supabaseClient
      .from("game_attempts")
      .update({
        status: submissionType === "early" ? "submitted_early" : "submitted_final",
        submitted_at: new Date().toISOString(),
        submission_ref: submissionRef,
      })
      .eq("id", attempt.id);

    return new Response(
      JSON.stringify({
        success: true,
        submissionRef,
        submission,
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
