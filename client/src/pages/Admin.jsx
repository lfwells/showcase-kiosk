import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const [kioskId, setKioskId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (kioskId.trim()) {
      navigate(`/kiosk/${kioskId}`);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h1 className="title">Kiosk Admin</h1>
      <p className="subtitle">Select a Kiosk ID to begin display</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="kioskId">Kiosk ID</label>
          <input
            id="kioskId"
            type="text"
            className="form-control"
            value={kioskId}
            onChange={(e) => setKioskId(e.target.value)}
            placeholder="e.g. kiosk1"
            required
          />
        </div>
        <button type="submit" className="btn" style={{ width: '100%' }}>Launch Kiosk</button>
      </form>
    </div>
  );
}

export default Admin;
