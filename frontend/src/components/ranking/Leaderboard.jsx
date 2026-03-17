import { useState, useEffect } from 'react';
import { rankingService } from '../../lib/supabaseRanking';
import RankingEntry from './RankingEntry';
import './Leaderboard.css';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRankings = async () => {
    try {
      const data = await rankingService.getTop(100);
      setRankings(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar el ranking');
      console.error('Error fetching rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-loading">Cargando ranking...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="leaderboard-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <h2 className="leaderboard-title">Tabla de Clasificación</h2>
      <div className="leaderboard-subtitle">Top 100 Jugadores</div>
      
      <div className="leaderboard-list">
        {rankings.length === 0 ? (
          <div className="leaderboard-empty">
            No hay jugadores en el ranking todavía
          </div>
        ) : (
          rankings.map((ranking) => (
            <RankingEntry key={ranking.rank} ranking={ranking} />
          ))
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
