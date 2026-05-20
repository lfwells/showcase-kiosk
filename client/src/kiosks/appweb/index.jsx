import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';
import KioskStatus from '../../components/KioskStatus';

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
      <KioskStatus
        isValid={isValid}
        timeLeft={timeLeft}
        title="Application and Web Development Kiosk"
        desc={<div><p>See if you can find a way to unlock this kiosk.</p><p><strong>Hint, you may need to 'inspect' it.</strong></p></div>}
      />

      <ScanProgress socket={socket} kioskId={kioskId} />
    </div>
  );
}

