import { supabase } from './supabase';

export const rankingService = {
  async getTop(limit = 100) {
    const { data, error } = await supabase
      .from('rankings')
      .select('user_id, completion_time, completed_at')
      .order('completion_time', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Fetch usernames from profiles separately
    const userIds = data.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = p.username; });

    return data.map((r, index) => ({
      rank: index + 1,
      username: profileMap[r.user_id] || 'Desconocido',
      completion_time: r.completion_time,
      completed_at: r.completed_at,
      formatted_time: formatTime(r.completion_time)
    }));
  },

  async getUserRank(userId) {
    const { data: userRanking } = await supabase
      .from('rankings')
      .select('user_id, completion_time, completed_at')
      .eq('user_id', userId)
      .single();

    if (!userRanking) return null;

    const { count } = await supabase
      .from('rankings')
      .select('*', { count: 'exact', head: true })
      .lt('completion_time', userRanking.completion_time);

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    return {
      rank: (count || 0) + 1,
      username: profile?.username || 'Desconocido',
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
