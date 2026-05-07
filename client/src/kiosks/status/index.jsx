import React, { useState, useEffect } from 'react';
import { getInteractiveKiosks, getKioskName } from '../../kioskDefs';

export default function StatusKiosk({ kioskId, socket }) {
  const [fobScans, setFobScans] = useState(null); // null = waiting for scan
  const [fobID, setFobID] = useState(null);
  const [allScans, setAllScans] = useState([]);

  useEffect(() => {
    // Mark status kiosk as always valid (any scan is accepted)
    socket.emit('kiosk_status_update', { kioskId, isValid: true });

    // Fetch all scans once to have the data ready
    fetch('/api/scans')
      .then(res => res.json())
      .then(setAllScans)
      .catch(console.error);

    // Keep scans up to date via socket
    const handleScansUpdate = (scans) => setAllScans(scans);
    socket.on('scans_update', handleScansUpdate);

    // Listen for scans on this kiosk
    const handleScan = (e) => {
      const scan = e.detail;
      setFobID(scan.fobID);
    };

    window.addEventListener('kiosk_scan', handleScan);

    return () => {
      window.removeEventListener('kiosk_scan', handleScan);
      socket.off('scans_update', handleScansUpdate);
    };
  }, [kioskId, socket]);

  // When fobID changes (a scan happened), compute the status from allScans
  useEffect(() => {
    if (!fobID) return;

    const interactiveKiosks = getInteractiveKiosks();

    const statusMap = interactiveKiosks.map(([id, def]) => {
      // Check if there's at least one valid scan for this fob at this kiosk
      const hasValidScan = allScans.some(
        scan => scan.fobID === fobID && scan.kioskID === id && scan.isValid
      );
      return { kioskId: id, name: def.name, completed: hasValidScan };
    });

    setFobScans(statusMap);
  }, [fobID, allScans]);

  // Auto-reset after 15 seconds
  useEffect(() => {
    if (!fobID) return;
    const timer = setTimeout(() => {
      setFobID(null);
      setFobScans(null);
    }, 15000);
    return () => clearTimeout(timer);
  }, [fobID]);

  const completedCount = fobScans ? fobScans.filter(k => k.completed).length : 0;
  const totalCount = fobScans ? fobScans.length : 0;

  return (
    <div style={styles.container}>
      {/* Background gradient overlay */}
      <div style={styles.bgOverlay} />

      {!fobID ? (
        <div style={styles.waitingContainer}>
          <div style={styles.pulseRing} />
          <div style={styles.iconContainer}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 12h.01" />
            </svg>
          </div>
          <h1 style={styles.waitingTitle}>Scan Your Fob</h1>
          <p style={styles.waitingSubtitle}>Hold your fob to the reader to check your progress</p>
        </div>
      ) : (
        <div style={styles.resultContainer}>
          <div style={styles.header}>
            <h1 style={styles.resultTitle}>
              Fob Status
            </h1>
            <p style={styles.fobLabel}>
              <span style={styles.fobBadge}>{fobID}</span>
            </p>
            <div style={styles.progressBarOuter}>
              <div
                style={{
                  ...styles.progressBarInner,
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
            <p style={styles.progressText}>
              {completedCount} of {totalCount} kiosks completed
            </p>
          </div>

          <div style={styles.kioskGrid}>
            {fobScans && fobScans.map((kiosk) => (
              <div
                key={kiosk.kioskId}
                style={{
                  ...styles.kioskCard,
                  borderColor: kiosk.completed ? '#10b981' : '#334155',
                  backgroundColor: kiosk.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(30, 41, 59, 0.6)',
                }}
              >
                <div style={styles.kioskCardIcon}>
                  {kiosk.completed ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div style={styles.kioskCardText}>
                  <span style={{
                    ...styles.kioskName,
                    color: kiosk.completed ? '#f0fdf4' : '#94a3b8',
                  }}>
                    {kiosk.name}
                  </span>
                  <span style={{
                    ...styles.kioskStatus,
                    color: kiosk.completed ? '#10b981' : '#475569',
                  }}>
                    {kiosk.completed ? 'Completed ✓' : 'Not yet visited'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {completedCount === totalCount && totalCount > 0 && (
            <div style={styles.completeBanner}>
              <span style={{ fontSize: '2rem' }}>🎉</span>
              <span style={styles.completeText}>All kiosks completed!</span>
            </div>
          )}

          <p style={styles.resetHint}>This screen will reset in 15 seconds</p>
        </div>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0.6; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  waitingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  pulseRing: {
    position: 'absolute',
    top: '-30px',
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '2px solid rgba(99, 102, 241, 0.4)',
    animation: 'pulse-ring 2s ease-in-out infinite',
  },
  iconContainer: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '2rem',
    boxShadow: '0 0 60px rgba(79, 70, 229, 0.4)',
  },
  waitingTitle: {
    fontSize: '3rem',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 0.5rem 0',
  },
  waitingSubtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 1,
    animation: 'fade-in-up 0.4s ease-out',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    width: '100%',
  },
  resultTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'white',
    margin: '0 0 0.75rem 0',
  },
  fobLabel: {
    margin: '0 0 1.5rem 0',
  },
  fobBadge: {
    display: 'inline-block',
    padding: '0.4rem 1.2rem',
    borderRadius: '9999px',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#a5b4fc',
    fontSize: '1rem',
    fontWeight: 600,
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  progressBarOuter: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #10b981, #34d399)',
    transition: 'width 0.6s ease-out',
  },
  progressText: {
    margin: 0,
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
  kioskGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
  },
  kioskCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    borderRadius: '12px',
    border: '1px solid',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s ease',
  },
  kioskCardIcon: {
    flexShrink: 0,
  },
  kioskCardText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  kioskName: {
    fontSize: '1.15rem',
    fontWeight: 600,
  },
  kioskStatus: {
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  completeBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '1.5rem',
    padding: '1rem 2rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1))',
    border: '1px solid rgba(16, 185, 129, 0.3)',
  },
  completeText: {
    color: '#34d399',
    fontSize: '1.25rem',
    fontWeight: 700,
  },
  resetHint: {
    marginTop: '2rem',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '0.85rem',
  },
};
