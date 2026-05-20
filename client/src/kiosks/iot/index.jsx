import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';
import KioskStatus from '../../components/KioskStatus';

export default function IoTKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);


  function init() {
  }

  useEffect(() => {
    init();
  }, []);

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
      init();
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
        title="Internet of Things Kiosk" 
      />

      <ScanProgress socket={socket} kioskId={kioskId} />

    </div>
  );
}

