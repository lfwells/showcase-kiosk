import React, { useState, useEffect } from 'react';

export default function Kiosk1({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Kiosk 1 logic: It becomes valid only when a button is pressed.
    // It becomes invalid again immediately after a valid scan.

    const handleScan = (e) => {
      const scan = e.detail;
      setLastScan(scan);
      
      if (scan.isValid) {
        // We received a valid scan! Reset status to invalid until button is pressed again.
        setIsValid(false);
        setFeedback(null);
        socket.emit('kiosk_status_update', { kioskId, isValid: false });
      }
    };

    window.addEventListener('kiosk_scan', handleScan);
    return () => window.removeEventListener('kiosk_scan', handleScan);
  }, [kioskId, socket]);

  const handleCorrectAnswer = () => {
    setFeedback(null);
    setIsValid(true);
    socket.emit('kiosk_status_update', { kioskId, isValid: true });
  };

  const handleIncorrectAnswer = () => {
    setFeedback('Incorrect answer, try again!');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: isValid ? '#064e3b' : '#7f1d1d' }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: 'white', textAlign: 'center' }}>University Trivia</h1>
      <p style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.8)' }}>
        Status: {isValid ? 'Ready for Scan' : 'Waiting for Answer'}
      </p>

      {!isValid && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 2rem' }}>
          <p style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
            In what year was the University of Tasmania founded?
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={handleIncorrectAnswer}
              style={{ padding: '1rem 2rem', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0' }}
            >
              1888
            </button>
            <button 
              onClick={handleCorrectAnswer}
              style={{ padding: '1rem 2rem', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0' }}
            >
              1890
            </button>
            <button 
              onClick={handleIncorrectAnswer}
              style={{ padding: '1rem 2rem', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0' }}
            >
              1901
            </button>
            <button 
              onClick={handleIncorrectAnswer}
              style={{ padding: '1rem 2rem', fontSize: '1.5rem', cursor: 'pointer', borderRadius: '8px', border: 'none', backgroundColor: '#e2e8f0' }}
            >
              1912
            </button>
          </div>
          {feedback && (
            <p style={{ marginTop: '1rem', fontSize: '1.2rem', color: '#fca5a5' }}>
              {feedback}
            </p>
          )}
        </div>
      )}

      {lastScan && (
        <div style={{ marginTop: '3rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '12px', color: 'white' }}>
          <h2>Last Scan</h2>
          <p>Fob ID: {lastScan.fobID}</p>
          <p>Status: {lastScan.isValid ? 'Success!' : 'Failed - Kiosk not ready'}</p>
        </div>
      )}
    </div>
  );
}
