import { supabase } from './supabase';

export const gameService = {
  // Start a new game session
  async startGame(userId) {
    // Check for existing active session
    const { data: existing } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('game_sessions')
      .insert({ user_id: userId, started_at: new Date().toISOString(), status: 'active', time_remaining: 1500 })
      .select()
      .single();

    if (error) throw error;

    // Init first puzzle progress
    const { data: firstPuzzle } = await supabase
      .from('puzzles')
      .select('id')
      .eq('sequence_order', 1)
      .single();

    if (firstPuzzle) {
      await supabase.from('puzzle_progress').insert({
        game_session_id: data.id,
        puzzle_id: firstPuzzle.id,
        started_at: new Date().toISOString(),
        is_completed: false,
        attempts: 0,
        hints_used: 0,
        time_spent: 0
      });
    }

    return data;
  },

  // Get active session
  async getActiveSession(userId) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Sync timer - calculate time remaining from started_at
  async syncSession(sessionId) {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('started_at, status')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    const elapsed = Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000);
    const timeRemaining = Math.max(0, 1500 - elapsed);

    if (timeRemaining <= 0) {
      await supabase.from('game_sessions').update({ status: 'timeout', completed_at: new Date().toISOString() }).eq('id', sessionId);
    }

    return { time_remaining: timeRemaining };
  },

  // Complete game
  async completeGame(sessionId, userId) {
    const { data: session } = await supabase
      .from('game_sessions')
      .select('started_at')
      .eq('id', sessionId)
      .single();

    const completionTime = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
    const completedAt = new Date().toISOString();

    await supabase.from('game_sessions').update({
      status: 'completed',
      completed_at: completedAt,
      completion_time: completionTime
    }).eq('id', sessionId);

    // Update ranking
    const { data: existing } = await supabase
      .from('rankings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (completionTime < existing.completion_time) {
        await supabase.from('rankings').update({ completion_time: completionTime, completed_at: completedAt }).eq('user_id', userId);
      }
    } else {
      await supabase.from('rankings').insert({ user_id: userId, completion_time: completionTime, completed_at: completedAt });
    }

    return { completion_time: completionTime };
  },

  // Abandon game
  async abandonGame(sessionId) {
    const { error } = await supabase
      .from('game_sessions')
      .update({ status: 'abandoned', completed_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
  },

  // Get current puzzle
  async getCurrentPuzzle(sessionId) {
    // Get completed puzzles for this session
    const { data: completed } = await supabase
      .from('puzzle_progress')
      .select('puzzle_id')
      .eq('game_session_id', sessionId)
      .eq('is_completed', true);

    const completedIds = completed?.map(p => p.puzzle_id) || [];

    // Get all puzzles ordered
    const { data: puzzles } = await supabase
      .from('puzzles')
      .select('*')
      .order('sequence_order', { ascending: true });

    // Find first uncompleted puzzle
    const current = puzzles?.find(p => !completedIds.includes(p.id));
    if (!current) return null;

    // Get time spent on this puzzle
    const { data: progress } = await supabase
      .from('puzzle_progress')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('puzzle_id', current.id)
      .single();

    const timeSpent = progress
      ? Math.floor((Date.now() - new Date(progress.started_at).getTime()) / 1000)
      : 0;

    return { ...current, time_spent: timeSpent, progress };
  },

  // Get session progress
  async getSessionProgress(sessionId) {
    const { data } = await supabase
      .from('puzzle_progress')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('is_completed', true);

    const { count } = await supabase
      .from('puzzles')
      .select('*', { count: 'exact', head: true });

    return { completed: data?.length || 0, total: count || 10 };
  },

  // Submit puzzle solution
  async submitSolution(sessionId, puzzleId, answer) {
    const { data: puzzle } = await supabase
      .from('puzzles')
      .select('solution_data, type, sequence_order')
      .eq('id', puzzleId)
      .single();

    const solutionData = puzzle.solution_data;
    const solution = solutionData.solution;

    let isCorrect = false;

    if (Array.isArray(solution)) {
      isCorrect = JSON.stringify(solution) === JSON.stringify(answer);
    } else if (typeof solution === 'string') {
      isCorrect = solution.toUpperCase() === String(answer).toUpperCase();
    } else {
      isCorrect = solution === answer;
    }

    // Update attempts
    const { data: progress } = await supabase
      .from('puzzle_progress')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('puzzle_id', puzzleId)
      .single();

    if (progress) {
      await supabase.from('puzzle_progress').update({
        attempts: (progress.attempts || 0) + 1,
        ...(isCorrect ? { is_completed: true, completed_at: new Date().toISOString() } : {})
      }).eq('id', progress.id);
    }

    if (isCorrect) {
      // Init next puzzle progress
      const { data: nextPuzzle } = await supabase
        .from('puzzles')
        .select('id')
        .eq('sequence_order', puzzle.sequence_order + 1)
        .single();

      if (nextPuzzle) {
        const existing = await supabase
          .from('puzzle_progress')
          .select('id')
          .eq('game_session_id', sessionId)
          .eq('puzzle_id', nextPuzzle.id)
          .single();

        if (!existing.data) {
          await supabase.from('puzzle_progress').insert({
            game_session_id: sessionId,
            puzzle_id: nextPuzzle.id,
            started_at: new Date().toISOString(),
            is_completed: false,
            attempts: 0,
            hints_used: 0,
            time_spent: 0
          });
        }
      }
    }

    return { correct: isCorrect };
  },

  // Get hint
  async getHint(puzzleId, level) {
    const { data, error } = await supabase
      .from('hints')
      .select('*')
      .eq('puzzle_id', puzzleId)
      .eq('level', level)
      .single();

    if (error) throw error;
    return data;
  },

  // Check hint availability (after 120 seconds)
  async checkHintAvailability(sessionId, puzzleId) {
    const { data: progress } = await supabase
      .from('puzzle_progress')
      .select('started_at, hints_used')
      .eq('game_session_id', sessionId)
      .eq('puzzle_id', puzzleId)
      .single();

    if (!progress) return { available: false, hints_used: 0, time_on_puzzle: 0 };

    const timeOnPuzzle = Math.floor((Date.now() - new Date(progress.started_at).getTime()) / 1000);
    return {
      available: timeOnPuzzle >= 120,
      hints_used: progress.hints_used || 0,
      time_on_puzzle: timeOnPuzzle
    };
  },

  // Use hint
  async useHint(sessionId, puzzleId) {
    const { data: progress } = await supabase
      .from('puzzle_progress')
      .select('hints_used')
      .eq('game_session_id', sessionId)
      .eq('puzzle_id', puzzleId)
      .single();

    if (progress) {
      await supabase.from('puzzle_progress').update({
        hints_used: (progress.hints_used || 0) + 1
      }).eq('game_session_id', sessionId).eq('puzzle_id', puzzleId);
    }
  }
};
