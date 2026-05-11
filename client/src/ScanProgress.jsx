import React, { useState, useEffect } from 'react';

export default function ScanProgress({ kioskId, socket }) {
    const [lastScan, setLastScan] = useState(null);

    useEffect(() => {
        // Note: You can remove socket from this dependency array 
        // if you aren't using it inside the effect anymore.
        const handleScan = (e) => {
            setLastScan(e.detail);
            if (e.detail.isValid == false)
                setTimeout(() => setLastScan(null), 2000);
        };

        window.addEventListener('kiosk_scan', handleScan);
        return () => window.removeEventListener('kiosk_scan', handleScan);
    }, [kioskId]);

    return (
        <div>
            {/* Check for explicit false to handle "Kiosk Not Ready" */}
            {lastScan && lastScan.isValid === false && (
                <div style={{ marginTop: '20px', padding: '10px', border: '2px solid red', borderRadius: '8px' }}>
                    <h4>Invalid Scan — Kiosk Not Ready!</h4>
                    <p>Make sure you complete the challenge first.</p>
                </div>
            )}

            {/* Check for explicit true to show progress */}
            {lastScan && lastScan.isValid === true && (
                <div style={{ width: "75vw", height: "25vh" }}>
                    <iframe
                        key={lastScan.timestamp} // Force refresh on every new scan
                        src={`/progress/${lastScan.fobID}/${lastScan.timestamp}`}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                    ></iframe>
                </div>
            )}
        </div>
    );
}