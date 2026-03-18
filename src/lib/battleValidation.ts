import { z } from 'zod';

/**
 * Schema validation for battle room data
 * Ensures data integrity before database operations
 */

export const BattleRoomStatusSchema = z.enum(['waiting', 'ready', 'active', 'finished']);

export const BattlePlayerSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1).max(20),
  score: z.number().int().min(0).max(10),
});

export const BattleRoomSchema = z.object({
  id: z.string().uuid(),
  room_code: z.string().length(6).regex(/^[A-Z0-9]{6}$/),
  host_id: z.string().uuid(),
  host_display_name: z.string().min(1).max(20),
  guest_id: z.string().uuid().nullable(),
  guest_display_name: z.string().min(1).max(20).nullable(),
  subject_id: z.string().min(1),
  topic_name: z.string().min(1),
  status: BattleRoomStatusSchema,
  current_question: z.number().int().min(0).max(10),
  host_score: z.number().int().min(0).max(10),
  guest_score: z.number().int().min(0).max(10),
  question_ids: z.array(z.string()).max(10),
  created_at: z.string().datetime(),
  started_at: z.string().datetime().nullable(),
  finished_at: z.string().datetime().nullable(),
});

export const BattleAnswerSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  user_id: z.string().uuid(),
  question_index: z.number().int().min(0).max(9),
  selected_answer: z.string().min(1),
  is_correct: z.boolean(),
  answered_at: z.string().datetime(),
});

export const CreateBattleRoomInputSchema = z.object({
  room_code: z.string().length(6).regex(/^[A-Z0-9]{6}$/),
  host_display_name: z.string().min(1).max(20).trim(),
  subject_id: z.string().min(1),
  topic_name: z.string().min(1),
});

export const JoinBattleRoomInputSchema = z.object({
  room_id: z.string().uuid(),
  guest_display_name: z.string().min(1).max(20).trim(),
});

export const SubmitAnswerInputSchema = z.object({
  room_id: z.string().uuid(),
  question_index: z.number().int().min(0).max(9),
  selected_answer: z.string().min(1),
});

// Type exports
export type BattleRoomStatus = z.infer<typeof BattleRoomStatusSchema>;
export type BattlePlayer = z.infer<typeof BattlePlayerSchema>;
export type BattleRoom = z.infer<typeof BattleRoomSchema>;
export type BattleAnswer = z.infer<typeof BattleAnswerSchema>;
export type CreateBattleRoomInput = z.infer<typeof CreateBattleRoomInputSchema>;
export type JoinBattleRoomInput = z.infer<typeof JoinBattleRoomInputSchema>;
export type SubmitAnswerInput = z.infer<typeof SubmitAnswerInputSchema>;

/**
 * Validation helpers
 */
export function validateRoomCode(code: string): boolean {
  try {
    z.string().length(6).regex(/^[A-Z0-9]{6}$/).parse(code);
    return true;
  } catch {
    return false;
  }
}

export function validateNickname(nickname: string): boolean {
  try {
    z.string().min(1).max(20).trim().parse(nickname);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeRoomCode(code: string): string {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function sanitizeNickname(nickname: string): string {
  return nickname.trim().slice(0, 20);
}
