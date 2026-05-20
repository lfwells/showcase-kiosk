import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';
import KioskStatus from '../../components/KioskStatus';

export default function GamesKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);


  function init() {
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    const handleScan = (e) => {
      const scan = e.detail;

      if (scan.isValid) {
        // We received a valid scan! Reset status to invalid until button is pressed again.
        setIsValid(false);
        socket.emit('kiosk_status_update', { kioskId, isValid: false });
      }
    };

    window.addEventListener('kiosk_scan', handleScan);
    return () => window.removeEventListener('kiosk_scan', handleScan);
  }, [kioskId, socket]);

  useEffect(() => {
    // Listen for the custom event from the server when the hidden endpoint is hit
    const handleValidated = () => {
      setIsValid(true);

      // Notify server we're officially valid (though endpoint did this too)
      socket.emit('kiosk_status_update', { kioskId, isValid: true });
    };

    socket.on('kiosk_games_validated', handleValidated);
    return () => socket.off('kiosk_games_validated', handleValidated);
  }, [kioskId, socket]);


  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      
      <KioskStatus 
        isValid={isValid} 
        title="Games and Creative Technologies Kiosk"
      >
        <div style={{ width: '100%', maxWidth: '1000px', margin: '20px auto', display: 'flex', justifyContent: 'center' }}>
          <iframe 
            src="/build_web/index.html" 
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              border: "none",
              borderRadius: "16px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
            }}
          ></iframe>
        </div>
      </KioskStatus>

      <ScanProgress socket={socket} kioskId={kioskId} />

    </div>
  );
}

