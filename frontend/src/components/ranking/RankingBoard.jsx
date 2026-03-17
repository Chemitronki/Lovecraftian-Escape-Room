import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import './RankingBoard.css';

const RankingBoard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [rankings, setRankings] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchRankings();
  }, [isAuthenticated, navigate]);

  const fetchRankings = async () => {
    try {
      setLoading(true);
      
      // Fetch top rankings
      const rankingsResponse = await axios.get('/ranking/top?limit=100');
      setRankings(rankingsResponse.data.rankings || []);

      // Fetch user's rank
      if (user?.id) {
        const userRankResponse = await axios.get(`/ranking/user/${user.id}`);
        setUserRank(userRankResponse.data);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching rankings:', err);
      setError(err.response?.data?.message || 'Error al cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="ranking-board">
      <div className="ranking-container">
        <div className="ranking-header">
          <h1 className="ranking-title">🏆 Ranking Global</h1>
          <p className="ranking-subtitle">Los mejores tiempos de escape</p>
        </div>

        {error && (
          <div className="ranking-error">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="ranking-loading">
            <div className="loading-spinner"></div>
            <p>Cargando ranking...</p>
          </div>
        ) : (
          <>
            {/* User's current rank */}
            {userRank && userRank.rank && (
              <div className="user-rank-card">
                <div className="user-rank-content">
                  <span className="user-rank-label">Tu Posición:</span>
                  <span className="user-rank-position">#{userRank.rank}</span>
                  <span className="user-rank-time">{userRank.formatted_time}</span>
                </div>
              </div>
            )}

            {/* Rankings table */}
            <div className="rankings-table">
              <div className="table-header">
                <div className="col-rank">Posición</div>
                <div className="col-username">Jugador</div>
                <div className="col-time">Tiempo</div>
                <div className="col-date">Fecha</div>
              </div>

              <div className="table-body">
                {rankings.length > 0 ? (
                  rankings.map((ranking, index) => (
                    <div 
                      key={index} 
                      className={`table-row ${userRank?.rank === ranking.rank ? 'current-user' : ''}`}
                    >
                      <div className="col-rank">
                        <span className={`rank-badge rank-${ranking.rank}`}>
                          {ranking.rank === 1 && '🥇'}
                          {ranking.rank === 2 && '🥈'}
                          {ranking.rank === 3 && '🥉'}
                          {ranking.rank > 3 && ranking.rank}
                        </span>
                      </div>
                      <div className="col-username">
                        {ranking.username}
                        {userRank?.rank === ranking.rank && <span className="you-badge">Tú</span>}
                      </div>
                      <div className="col-time">
                        <span className="time-value">{ranking.formatted_time}</span>
                      </div>
                      <div className="col-date">
                        {new Date(ranking.completed_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-rankings">
                    <p>Aún no hay registros en el ranking</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="ranking-actions">
          <button 
            onClick={handleBackHome}
            className="btn-back-home"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingBoard;
