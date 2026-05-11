import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';

export default function AppWebKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);


  useEffect(() => {
    // Listen for the custom event from the server when the hidden endpoint is hit
    const handleValidated = () => {
      setIsValid(true);
      setTimeLeft(20);

      // Notify server we're officially valid (though endpoint did this too)
      socket.emit('kiosk_status_update', { kioskId, isValid: true });
    };

    socket.on('kiosk_appweb_validated', handleValidated);
    return () => socket.off('kiosk_appweb_validated', handleValidated);
  }, [kioskId, socket]);

  useEffect(() => {
    if (timeLeft > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isValid) {
      // Time is up, invalidate
      setIsValid(false);
      socket.emit('kiosk_status_update', { kioskId, isValid: false });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isValid, kioskId, socket]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Application and Web Development Kiosk</h1>
      <p>This kiosk is currently <strong>{isValid ? 'VALID' : 'INVALID'}</strong>.</p>

      {isValid ? (
        <div>
          <h2 style={{ color: 'green' }}>Access Granted!</h2>
          <h3>Time remaining: {timeLeft}s</h3>
          <p>Scan as many fobs as you like before time runs out!</p>
        </div>
      ) : (
        <div>
          <h2 style={{ color: 'red' }}>Access Denied</h2>
          <p>Find a way to unlock this kiosk...</p>
        </div>
      )}

      <ScanProgress socket={socket} kioskId={kioskId} />
    </div>
  );
}
