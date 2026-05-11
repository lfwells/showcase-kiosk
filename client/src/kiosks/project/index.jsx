import React, { useState, useEffect } from 'react';
import ScanProgress from '../../ScanProgress';

export default function ProjectKiosk({ kioskId, socket }) {
  useEffect(() => {
    socket.emit('kiosk_status_update', { kioskId, isValid: true });
  }, [kioskId, socket]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e3a8a' }}>
      <h1 style={{ fontSize: '4rem', margin: 0, color: 'white' }}>Scan to Check Your Progress!</h1>

      <ScanProgress socket={socket} kioskId={kioskId} />
    </div>
  );
}
