import React, { useState, useEffect } from 'react';
import { getInteractiveKiosks } from '../kioskDefs';

function Progress() {
    const [result, setResult] = useState(null);

    const fetchProgress = async () => {
        const pathParts = window.location.pathname.split('/');
        const fobID = pathParts.pop() || pathParts.pop();

        try {
            const res = await fetch('/api/progress/' + fobID, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            setResult(data);
            handleAutoHide();
        } catch (err) {
            console.error(err);
            setResult(null);
        }
    };

    const handleAutoHide = () => {
        const params = new URLSearchParams(window.location.search);
        const timeout = parseInt(params.get('timeout')) || 5000;

        setTimeout(() => {
            if (document.body) {
                document.body.style.display = "none";
            }
        }, timeout);
    };

    useEffect(() => {
        fetchProgress();
    }, []);

    const kiosks = getInteractiveKiosks();

    if (result == null) return null;

    return (
        <div className="passport-full-width-wrapper">
            <style>{`
                /* Absolute Reset */
                html, body, #root, .App, .container, .container-fluid {
                    margin: 0 !important;
                    padding: 0 !important;
                    max-width: none !important;
                    width: 100% !important;
                    background: black !important;
                    overflow: hidden;
                }

                .passport-full-width-wrapper {
                    background: #f4e4bc; 
                    height: 350px; 
                    width: 100vw;
                    margin: 0;
                    padding: 10px; /* Small outer padding for the gap look */
                    font-family: 'Courier New', Courier, monospace;
                    color: #333;
                    background-image: radial-gradient(#dccba0 1.5px, transparent 1.5px);
                    background-size: 20px 20px;
                    box-sizing: border-box;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                .stamp-row {
                    display: flex; 
                    flex-direction: row;
                    width: 100%;
                    height: 100%;
                    gap: 12px; /* Physical spacing between stamps */
                    margin: 0;
                    padding: 0;
                }

                .visa-slot {
                    /* Calculate width to fit exactly 6 with gaps */
                    width: calc((100% - (5 * 12px)) / 6); 
                    height: 100%;
                    border: 2px solid rgba(168, 154, 120, 0.5);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    background: rgba(255,255,255,0.3);
                    box-sizing: border-box;
                    box-shadow: 2px 2px 5px rgba(0,0,0,0.05);
                }

                .kiosk-label {
                    font-size: 14px; 
                    font-weight: 900;
                    color: #000;
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 12px 2px;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: rgba(168, 154, 120, 0.3);
                    border-top: 2px solid rgba(0,0,0,0.1);
                }

                .stamp {
                    font-weight: 900;
                    text-transform: uppercase;
                    padding: 8px 12px;
                    border: 6px solid; 
                    border-radius: 4px;
                    transform: rotate(-5deg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    margin-bottom: 55px; 
                    max-width: 90%;
                    user-select: none;
                }

                .stamp-title {
                    font-size: 1.8rem; 
                    line-height: 0.9;
                }

                .stamp-visited {
                    color: #a62c2b;
                    border-color: #a62c2b;
                    background: repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 2px,
                      rgba(166, 44, 43, 0.05) 3px
                    );
                }

                .stamp-not-visited {
                    color: #bbb;
                    border-color: #ccc;
                    transform: rotate(0deg);
                    opacity: 0.2;
                }

                .date-sub {
                    font-size: 10px;
                    font-weight: bold;
                    margin-top: 5px;
                }
            `}</style>

            <div className="stamp-row">
                {kiosks.slice(0, 6).map(([kioskID, kiosk]) => {
                    const scanEntry = result.find(scan => scan.kioskID === kioskID && scan.isValid);

                    return (
                        <div key={kioskID} className="visa-slot">
                            {scanEntry ? (
                                <div className="stamp stamp-visited">
                                    <span className="stamp-title">CLEARED</span>
                                    <span className="date-sub">
                                        {new Date(scanEntry.timestamp || Date.now()).toLocaleDateString()}
                                    </span>
                                </div>
                            ) : (
                                <div className="stamp stamp-not-visited">
                                    <span className="stamp-title" style={{ fontSize: '1.4rem' }}>MISSING</span>
                                </div>
                            )}
                            <div className="kiosk-label">{kiosk.name}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Progress;