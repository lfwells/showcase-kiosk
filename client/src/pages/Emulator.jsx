import React, { useState } from 'react';
import { getAllKiosks, getKioskName } from '../kioskDefs';

function Emulator() {
  const [fobID, setFobID] = useState('');
  const [kioskID, setKioskID] = useState('');
  const [result, setResult] = useState(null);

  const kiosks = getAllKiosks();

  const handleScan = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fobID, kioskID })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: err.message });
    }
  };

  return (
    <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h1 className="title">Scanner Emulator</h1>
      <p className="subtitle">Simulate a fob scan at a specific kiosk</p>
      
      <form onSubmit={handleScan}>
        <div className="form-group">
          <label htmlFor="fobID">Fob ID</label>
          <input
            id="fobID"
            type="text"
            className="form-control"
            value={fobID}
            onChange={(e) => setFobID(e.target.value)}
            required
            placeholder="e.g. fob-1234"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="kioskID">Kiosk</label>
          <select
            id="kioskID"
            className="form-control"
            value={kioskID}
            onChange={(e) => setKioskID(e.target.value)}
            required
          >
            <option value="" disabled>Select a kiosk…</option>
            {kiosks.map(([id, def]) => (
              <option key={id} value={id}>
                {def.name} ({id})
              </option>
            ))}
          </select>
        </div>
        
        <button type="submit" className="btn">Simulate Scan</button>
      </form>

      {result && (
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <h3>Result</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default Emulator;
