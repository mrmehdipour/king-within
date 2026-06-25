'use client'

// Thin Supabase CRUD helpers for the admin CMS. All writes are gated server-side
// by the is_admin() RLS policies in db/03_cms_schema.sql, so a non-admin calling
// these simply gets denied by the database.

import { supabase } from './supabaseClient'

// --- Dashboard counts -------------------------------------------------------
export async function getContentCounts() {
  const head = { count: 'exact', head: true }
  const [levels, questions, tracks, posts, journal] = await Promise.all([
    supabase.from('levels').select('level_id', head),
    supabase.from('questions').select('id', head),
    supabase.from('blog_tracks').select('id', head),
    supabase.from('blog_posts').select('id', head),
    supabase.from('journal_questions').select('id', head),
  ])
  return {
    levels: levels.count ?? 0,
    questions: questions.count ?? 0,
    tracks: tracks.count ?? 0,
    posts: posts.count ?? 0,
    journal: journal.count ?? 0,
  }
}

// --- Courses (levels + questions) ------------------------------------------
export const listLevels = () =>
  supabase.from('levels').select('*').order('archetype_stage').order('level_number')
export const upsertLevel = (row) => supabase.from('levels').upsert(row).select().single()
export async function deleteLevel(id) {
  // clear self-referencing unlocks first to avoid FK violation
  await supabase.from('levels').update({ unlock_requirement: null }).eq('unlock_requirement', id)
  return supabase.from('levels').delete().eq('level_id', id)
}
export const listQuestions = (levelId) =>
  supabase.from('questions').select('*').eq('level_id', levelId).order('sort_order')
export const upsertQuestion = (row) => supabase.from('questions').upsert(row).select().single()
export const deleteQuestion = (id) => supabase.from('questions').delete().eq('id', id)

// --- Course blocks (flexible parts) ----------------------------------------
export const listBlocks = (levelId) =>
  supabase.from('course_blocks').select('*').eq('level_id', levelId).order('sort_order')
export const upsertBlock = (row) => supabase.from('course_blocks').upsert(row).select().single()
export const deleteBlock = (id) => supabase.from('course_blocks').delete().eq('id', id)

// --- Blog (tracks + posts) -------------------------------------------------
export const listTracks = () => supabase.from('blog_tracks').select('*').order('sort_order')
export const upsertTrack = (row) => supabase.from('blog_tracks').upsert(row).select().single()
export const deleteTrack = (id) => supabase.from('blog_tracks').delete().eq('id', id)
export const listPosts = () =>
  supabase.from('blog_posts').select('*').order('track_id', { nullsFirst: true }).order('order_in_track')
export const upsertPost = (row) => supabase.from('blog_posts').upsert(row).select().single()
export const deletePost = (id) => supabase.from('blog_posts').delete().eq('id', id)

// --- User answers (read-only, for AI analysis prep) ------------------------
export const listAllAnswers = () =>
  supabase.from('user_answers')
    .select('user_id, id, type, answer, is_correct, created_at, levels(title, level_number)')
    .order('created_at', { ascending: false })

export const listProfilesForUsers = (userIds) =>
  supabase.from('profiles')
    .select('id, current_archetype, total_xp')
    .in('id', userIds)

// --- Journal questions ------------------------------------------------------
export const listJournalQuestions = () =>
  supabase.from('journal_questions').select('*').order('id', { ascending: false })
export const bulkAddJournalQuestions = (prompts, category = 'custom') =>
  supabase.from('journal_questions').insert(prompts.map((p) => ({ prompt: p, category, published: true })))
export const updateJournalQuestion = (id, patch) => supabase.from('journal_questions').update(patch).eq('id', id)
export const deleteJournalQuestion = (id) => supabase.from('journal_questions').delete().eq('id', id)
