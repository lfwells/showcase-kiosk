import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllKiosks } from '../kioskDefs';

function Admin() {
  const navigate = useNavigate();
  const kiosks = getAllKiosks();

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '4rem auto' }}>
      <h1 className="title">Kiosk Admin</h1>
      <p className="subtitle">Select a kiosk to launch its display</p>

      <div className="kiosk-select-list">
        {kiosks.map(([id, def]) => (
          <button
            key={id}
            id={`launch-${id}`}
            className="kiosk-select-item"
            onClick={() => navigate(`/kiosk/${id}`)}
          >
            <div className="kiosk-select-info">
              <span className="kiosk-select-name">{def.name}</span>
              <span className="kiosk-select-id">{id}</span>
            </div>
            <div className="kiosk-select-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Admin;
