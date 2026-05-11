import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { socket } from '../socket';

function Kiosk() {
  const { id } = useParams();
  const [DynamicKiosk, setDynamicKiosk] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Register kiosk
    socket.emit('register_kiosk', id);

    // Try to load the specific kiosk component
    const loadKioskComponent = async () => {
      try {
        // Dynamic import based on id
        // Using Vite's dynamic import pattern. Note: In a real Vite app, dynamic imports with variables 
        // require some constraints. This syntax assumes the files exist in src/kiosks/.
        const module = await import(`../kiosks/${id}/index.jsx`);
        setDynamicKiosk(() => module.default);
      } catch (err) {
        console.error("Failed to load kiosk module:", err);
        setError(`Could not load component for kiosk: ${id}`);
      }
    };

    loadKioskComponent();

    // Listen for scans on this specific kiosk
    const handleScan = (scan) => {
      console.log('Received scan:', scan);
      // We can pass this via context or props if needed, or the child component can listen
      // But we will let the child component handle its own business if it wants,
      // or we can expose a global event bus. 
      // For simplicity, we just dispatch a custom window event that the child can listen to.
      window.dispatchEvent(new CustomEvent('kiosk_scan', { detail: scan }));
    };

    socket.on(`scan_result_${id}`, handleScan);

    return () => {
      socket.off(`scan_result_${id}`, handleScan);
      // disconnect handles unregistering automatically on server
    };
  }, [id]);

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ color: 'var(--error)' }}>{error}</h2>
        <p>Please check the Kiosk ID and ensure the corresponding folder exists in src/kiosks/</p>
      </div>
    );
  }

  if (!DynamicKiosk) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading Kiosk {id}...</h2>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicKiosk kioskId={id} socket={socket} />
      <div className="logo"><div className="logo-bg"></div></div>
    </Suspense>
  );
}

export default Kiosk;
