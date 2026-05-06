import React, { useState, useEffect } from 'react';

export default function Kiosk1({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [lastScan, setLastScan] = useState(null);

  useEffect(() => {
    // Kiosk 1 logic: It becomes valid only when a button is pressed.
    // It becomes invalid again immediately after a valid scan.

    const handleScan = (e) => {
      const scan = e.detail;
      setLastScan(scan);
      
      if (scan.isValid) {
        // We received a valid scan! Reset status to invalid until button is pressed again.
        setIsValid(false);
        socket.emit('kiosk_status_update', { kioskId, isValid: false });
      }
    };

    window.addEventListener('kiosk_scan', handleScan);
    return () => window.removeEventListener('kiosk_scan', handleScan);
  }, [kioskId, socket]);

  const handleAnswer = () => {
    setIsValid(true);
    socket.emit('kiosk_status_update', { kioskId, isValid: true });
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: isValid ? '#064e3b' : '#7f1d1d' }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: 'white' }}>Welcome to Kiosk 1</h1>
      <p style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.8)' }}>
        Status: {isValid ? 'Ready for Scan' : 'Waiting for Answer'}
      </p>

      {!isValid && (
        <button 
          onClick={handleAnswer}
          style={{ padding: '1rem 2rem', fontSize: '1.5rem', marginTop: '2rem', cursor: 'pointer', borderRadius: '8px', border: 'none' }}
        >
          Answer Question Correctly
        </button>
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
