import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import { getKioskName } from '../kioskDefs';

function Dashboard() {
  const [scans, setScans] = useState([]);
  const [kiosks, setKiosks] = useState({});

  useEffect(() => {
    // Initial fetch
    fetch('/api/scans').then(res => res.json()).then(setScans).catch(console.error);
    fetch('/api/kiosks').then(res => res.json()).then(setKiosks).catch(console.error);

    socket.on('scans_update', (newScans) => {
      setScans(newScans);
    });

    socket.on('kiosks_update', (newKiosks) => {
      setKiosks(newKiosks);
    });

    return () => {
      socket.off('scans_update');
      socket.off('kiosks_update');
    };
  }, []);

  return (
    <div>
      <h1 className="title">Manager Dashboard</h1>
      
      <div className="grid">
        <div className="card">
          <h2 className="subtitle">Active Kiosks</h2>
          {Object.keys(kiosks).length === 0 ? (
            <p>No kiosks known to the system yet.</p>
          ) : (
            <div>
              {Object.entries(kiosks).map(([id, info]) => (
                <div key={id} className="kiosk-status-card">
                  <div>
                    <span style={{ fontWeight: 600 }}>{getKioskName(id)}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge ${info.isOnline ? 'success' : 'offline'}`}>
                      {info.isOnline ? 'Online' : 'Offline'}
                    </span>
                    <span className={`badge ${info.isValid ? 'success' : 'error'}`}>
                      {info.isValid ? 'Valid State' : 'Invalid State'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="subtitle">Recent Scans</h2>
          {scans.length === 0 ? (
            <p>No scans recorded.</p>
          ) : (
            <ul className="scan-list">
              {scans.map((scan, idx) => (
                <li key={idx} className="scan-item">
                  <div>
                    <div style={{ fontWeight: 600 }}>Fob: {scan.fobID}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {getKioskName(scan.kioskID)} &bull; {new Date(scan.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span className={`badge ${scan.isValid ? 'success' : 'error'}`}>
                    {scan.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
