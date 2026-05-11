import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';

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

      <h1>Games and Creative Technologies Kiosk</h1>
      <p>This kiosk is currently <strong>{isValid ? 'VALID' : 'INVALID'}</strong>.</p>


      <iframe src="/build_web/index.html" style={{
        marginLeft: "0em",
        width: "100vw",
        aspectRatio: "16 / 9",
        border: "0",
        left: 0,
        position: "absolute"
      }}></iframe>

      <ScanProgress socket={socket} kioskId={kioskId} />

    </div>
  );
}
