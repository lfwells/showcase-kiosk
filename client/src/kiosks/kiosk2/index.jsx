import React, { useState, useEffect } from 'react';

export default function Kiosk2({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  useEffect(() => {
    // Kiosk 2 logic: Always valid, just counts scans
    socket.emit('kiosk_status_update', { kioskId, isValid: true });

    const handleScan = (e) => {
      setScanCount(prev => prev + 1);
    };

    window.addEventListener('kiosk_scan', handleScan);
    return () => window.removeEventListener('kiosk_scan', handleScan);
  }, [kioskId, socket]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e3a8a' }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: 'white' }}>Kiosk 2: Information Desk</h1>
      <p style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.8)' }}>
        Always ready for scans!
      </p>

      <div style={{ marginTop: '3rem', fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>
        Total Scans: {scanCount}
      </div>
    </div>
  );
}
