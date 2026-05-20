import React from 'react';

export default function KioskStatus({
  isValid,
  timeLeft,
  title,
  subtitle,
  desc,
  children
}) {
  // Determine text fallbacks if none are provided
  const displaySubtitle = subtitle !== undefined 
    ? subtitle 
    : (isValid ? 'Access Granted!' : 'Access Denied');

  const displayDesc = desc !== undefined 
    ? desc 
    : (isValid 
        ? 'Scan as many fobs as you like before time runs out!' 
        : 'Find a way to unlock this kiosk...');

  return (
    <div className="kiosk-status-container">
      {/* Dynamic Keyframes and Styles Injection */}
      <style>{`
        .kiosk-status-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
          margin: 40px auto 20px;
          padding: 0 20px;
          box-sizing: border-box;
        }

        .kiosk-title {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 2rem;
          background: linear-gradient(135deg, var(--text-main) 30%, var(--text-muted) 90%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
        }

        .kiosk-status-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(16px);
          border-radius: 24px;
          padding: 40px 30px;
          box-sizing: border-box;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 2rem;
        }

        .kiosk-status-card.valid {
          border-color: rgba(16, 185, 129, 0.25);
          box-shadow: 0 20px 45px rgba(16, 185, 129, 0.06);
        }

        .kiosk-status-card.invalid {
          border-color: rgba(239, 68, 68, 0.25);
          box-shadow: 0 20px 45px rgba(239, 68, 68, 0.06);
        }

        /* Icon Container & Animations */
        .status-icon-wrapper {
          position: relative;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .status-icon-wrapper.valid {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%);
          color: #10b981;
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
        }

        .status-icon-wrapper.invalid {
          background: radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
          color: #ef4444;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
        }

        /* Pulsing Ring Effect */
        .status-icon-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px solid currentColor;
          opacity: 0.15;
          animation: ringPulse 2s infinite ease-out;
        }

        @keyframes ringPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          100% {
            transform: scale(1.25);
            opacity: 0;
          }
        }

        /* Animated SVGs */
        .svg-icon {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes popIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          70% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Access text styles */
        .status-subtitle {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          transition: color 0.3s ease;
          text-align: center;
        }

        .status-subtitle.valid {
          color: #10b981;
        }

        .status-subtitle.invalid {
          color: #ef4444;
        }

        .status-desc {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin: 0 0 16px 0;
          text-align: center;
          line-height: 1.5;
        }

        /* Timer Badge */
        .timer-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          color: #10b981;
          font-weight: 700;
          font-size: 1.1rem;
          animation: timerPulse 1s infinite alternate;
          margin-top: 8px;
        }

        @keyframes timerPulse {
          0% {
            transform: scale(0.98);
            box-shadow: 0 0 0 rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(1.02);
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.15);
          }
        }

        /* Custom Children slot block */
        .kiosk-children-slot {
          width: 100%;
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Main Kiosk Title Header */}
      {title && <h1 className="kiosk-title">{title}</h1>}

      {/* Reusable status card container */}
      <div className={`kiosk-status-card ${isValid ? 'valid' : 'invalid'}`}>
        
        {/* Animated Badge Indicator */}
        <div className={`status-icon-wrapper ${isValid ? 'valid' : 'invalid'}`}>
          <div className="status-icon-ring"></div>
          {isValid ? (
            /* Checkmark (Tick) SVG Icon */
            <svg 
              className="svg-icon" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            /* X SVG Icon */
            <svg 
              className="svg-icon" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>

        {/* Text descriptions */}
        <h2 className={`status-subtitle ${isValid ? 'valid' : 'invalid'}`}>
          {displaySubtitle}
        </h2>
        
        <p className="status-desc">
          {displayDesc}
        </p>

        {/* Dynamic countdown timer badge */}
        {isValid && timeLeft !== undefined && timeLeft > 0 && (
          <div className="timer-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Time remaining: {timeLeft}s
          </div>
        )}
      </div>

      {/* Children elements (e.g. Trivia forms, games iframe, cipher text generator) */}
      {children && (
        <div className="kiosk-children-slot">
          {children}
        </div>
      )}
    </div>
  );
}
