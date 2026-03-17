import { supabase } from './supabase';

export const rankingService = {
  async getTop(limit = 100) {
    const { data, error } = await supabase
      .from('rankings')
      .select('*, profiles(username)')
      .order('completion_time', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return data.map((r, index) => ({
      rank: index + 1,
      username: r.profiles?.username || 'Desconocido',
      completion_time: r.completion_time,
      completed_at: r.completed_at,
      formatted_time: formatTime(r.completion_time)
    }));
  },

  async getUserRank(userId) {
    const { data: userRanking } = await supabase
      .from('rankings')
      .select('*, profiles(username)')
      .eq('user_id', userId)
      .single();

    if (!userRanking) return null;

    const { count } = await supabase
      .from('rankings')
      .select('*', { count: 'exact', head: true })
      .lt('completion_time', userRanking.completion_time);

    return {
      rank: (count || 0) + 1,
      username: userRanking.profiles?.username,
      completion_time: userRanking.completion_time,
      formatted_time: formatTime(userRanking.completion_time)
    };
  }
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
