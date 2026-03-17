import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { rankingService } from '../../lib/supabaseRanking';
import './UserRank.css';

const UserRank = () => {
  const user = useSelector((state) => state.auth.user);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserRank();
      const interval = setInterval(fetchUserRank, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUserRank = async () => {
    try {
      const data = await rankingService.getUserRank(user.id);
      setUserRank(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar tu posición');
      console.error('Error fetching user rank:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="user-rank-container">
        <div className="user-rank-loading">Cargando tu posición...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-rank-container">
        <div className="user-rank-error">{error}</div>
      </div>
    );
  }

  if (!userRank || !userRank.rank) {
    return (
      <div className="user-rank-container">
        <div className="user-rank-empty">
          Completa el escape room para aparecer en el ranking
        </div>
      </div>
    );
  }

  return (
    <div className="user-rank-container">
      <h3 className="user-rank-title">Tu Posición</h3>
      <div className="user-rank-card">
        <div className="user-rank-position">#{userRank.rank}</div>
        <div className="user-rank-details">
          <div className="user-rank-username">{userRank.username}</div>
          <div className="user-rank-time">{userRank.formatted_time}</div>
        </div>
      </div>
    </div>
  );
};

export default UserRank;
