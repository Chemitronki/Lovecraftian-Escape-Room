import './LoadingSkeleton.css';

export const PuzzleSkeleton = () => (
  <div className="puzzle-skeleton">
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-description"></div>
    <div className="skeleton skeleton-content"></div>
    <div className="skeleton skeleton-button"></div>
  </div>
);

export const RankingSkeleton = () => (
  <div className="ranking-skeleton">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="skeleton skeleton-ranking-entry"></div>
    ))}
  </div>
);

export const TimerSkeleton = () => (
  <div className="timer-skeleton">
    <div className="skeleton skeleton-timer-label"></div>
    <div className="skeleton skeleton-timer-value"></div>
  </div>
);

export const CardSkeleton = () => (
  <div className="card-skeleton">
    <div className="skeleton skeleton-card-header"></div>
    <div className="skeleton skeleton-card-body"></div>
  </div>
);
