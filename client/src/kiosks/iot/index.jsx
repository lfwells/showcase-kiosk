import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';
import KioskStatus from '../../components/KioskStatus';

export default function IoTKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  // Initialize kiosk status and listen for updates



  function init() {
    fetch('/kiosk/iot/check', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((data) => {
        setIsValid(data.isValid);
      })
      .catch((err) => {
        console.error('Error checking kiosk status:', err);
      });
  }

  useEffect(() => {
    init();
  }, []);



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

