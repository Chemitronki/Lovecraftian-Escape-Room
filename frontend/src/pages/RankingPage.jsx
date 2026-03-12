import { useNavigate } from 'react-router-dom';
import { Leaderboard, UserRank } from '../components/ranking';
import '../styles/animations.css';

const RankingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
      <div className="max-w-4xl mx-auto fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-purple-400 mb-4 font-serif glitch-text">
            Ranking Global
          </h1>
          <p className="text-gray-400 text-lg">
            Los mejores tiempos de escape
          </p>
        </div>

        {/* User's rank */}
        <UserRank />

        {/* Leaderboard */}
        <Leaderboard />

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate('/game')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 touch-target"
          >
            Jugar de Nuevo
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 touch-target"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
