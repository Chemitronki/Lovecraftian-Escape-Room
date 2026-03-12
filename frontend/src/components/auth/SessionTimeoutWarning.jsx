import { useState, useEffect } from 'react';
import './SessionTimeoutWarning.css';

const SessionTimeoutWarning = ({ onExtend, onLogout }) => {
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="session-timeout-overlay">
      <div className="session-timeout-modal">
        <div className="timeout-icon">⏰</div>
        
        <h2 className="timeout-title">Sesión por Expirar</h2>
        
        <p className="timeout-message">
          Tu sesión expirará en <span className="timeout-countdown">{formatTime(timeRemaining)}</span>
        </p>
        
        <p className="timeout-description">
          ¿Deseas continuar con tu sesión?
        </p>

        <div className="timeout-actions">
          <button 
            className="timeout-btn timeout-btn-primary"
            onClick={onExtend}
          >
            Continuar Sesión
          </button>
          <button 
            className="timeout-btn timeout-btn-secondary"
            onClick={onLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
