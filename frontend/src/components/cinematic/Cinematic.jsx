import { useState, useEffect } from 'react';
import './Cinematic.css';

const Cinematic = ({ type = 'opening', onComplete }) => {
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Allow skipping after 2 seconds
    const timer = setTimeout(() => setCanSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    if (canSkip && onComplete) {
      onComplete();
    }
  };

  const handleCinematicEnd = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="cinematic-overlay">
      <div className="cinematic-content">
        {type === 'opening' && <OpeningCinematic onEnd={handleCinematicEnd} />}
        {type === 'cthulhu' && <CthulhuCinematic onEnd={handleCinematicEnd} />}
        {type === 'victory' && <VictoryCinematic onEnd={handleCinematicEnd} />}
      </div>

      {canSkip && (
        <button 
          className="cinematic-skip-btn"
          onClick={handleSkip}
          aria-label="Saltar cinemática"
        >
          Saltar →
        </button>
      )}
    </div>
  );
};

const OpeningCinematic = ({ onEnd }) => {
  useEffect(() => {
    const timer = setTimeout(onEnd, 10000); // 10 seconds
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="opening-cinematic">
      {/* Background image */}
      <div className="cinematic-bg-image" style={{
        backgroundImage: 'url(/cinematics/cave.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}></div>

      {/* Overlay for text readability */}
      <div className="cinematic-overlay-dark"></div>

      {/* Main text content */}
      <div className="cinematic-text">
        <p className="cinematic-line delay-1">
          En las profundidades olvidadas...
        </p>
        <p className="cinematic-line delay-2">
          Donde la luz no alcanza...
        </p>
        <p className="cinematic-line delay-3">
          Yace una gruta ancestral...
        </p>
        <p className="cinematic-line delay-4">
          Hogar de los Antiguos...
        </p>
        <p className="cinematic-line delay-5">
          ¿Podrás escapar antes de que sea demasiado tarde?
        </p>
      </div>

      {/* Atmospheric effects */}
      <div className="cinematic-vignette" />
      <div className="cinematic-fog"></div>
    </div>
  );
};

const CthulhuCinematic = ({ onEnd }) => {
  useEffect(() => {
    const timer = setTimeout(onEnd, 12000); // 12 seconds
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="cthulhu-cinematic">
      {/* Background image */}
      <div className="cinematic-bg-image" style={{
        backgroundImage: 'url(/cinematics/cthulhu.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}></div>

      {/* Darkness overlay that fades out (revealing the image) */}
      <div className="cthulhu-darkness-overlay"></div>

      {/* Text overlay */}
      <div className="cinematic-text cthulhu-text">
        <p className="cthulhu-line delay-1">
          Los sellos se rompen...
        </p>
        <p className="cthulhu-line delay-2">
          La criatura despierta...
        </p>
        <p className="cthulhu-line delay-3">
          CTHULHU HA REVIVIDO
        </p>
        <p className="cthulhu-line delay-4">
          Pero has escapado de su gruta...
        </p>
        <p className="cthulhu-line delay-5">
          Por ahora...
        </p>
      </div>

      {/* Atmospheric effects */}
      <div className="cthulhu-vignette" />
    </div>
  );
};

const VictoryCinematic = ({ onEnd }) => {
  useEffect(() => {
    const timer = setTimeout(onEnd, 6000); // 6 seconds
    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="victory-cinematic">
      <div className="cinematic-text fade-in-slow">
        <p className="cinematic-title delay-1">
          ¡HAS ESCAPADO!
        </p>
        <p className="cinematic-line delay-2">
          La luz del mundo exterior te recibe...
        </p>
        <p className="cinematic-line delay-3">
          Pero las sombras nunca olvidan...
        </p>
      </div>
      
      <div className="victory-glow" />
    </div>
  );
};

export default Cinematic;
