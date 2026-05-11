import React, { useState, useEffect } from 'react';
import { getAllKiosks, getInteractiveKiosks, getKioskName } from '../kioskDefs';

function Progress() {
    const [result, setResult] = useState(null);


    const fetchProgress = async () => {
        var fobID = window.location.pathname.split('/').pop();
        try {
            const res = await fetch('/api/progress/' + fobID, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            setResult(data);

            setTimeout(() => document.getElementsByTagName("body")[0].style.display = "none", 2000);
        } catch (err) {
            console.error(err);
            setResult(null);
        }
    };

    useEffect(() => fetchProgress(), []);

    let kiosks = getInteractiveKiosks();

    if (result == null) return <h1>Loading...</h1>;


    return (
        <table>
            <thead>
                <tr>
                    {kiosks.map(([kioskID, kiosk]) => {
                        return <th>{kiosk.name}</th>;
                    })}
                </tr>
            </thead>
            <tbody>
                <tr>
                    {kiosks.map(([kioskID, kiosk]) => {
                        var visited = false;
                        console.log(result);
                        result.forEach(scan => {
                            console.log(scan);
                            if (scan.kioskID == kioskID && scan.isValid == true) {
                                visited = true;
                            }
                        });
                        return (
                            <td>{(visited ? 'visted' : 'not visited')}</td>
                        );
                    })}
                </tr>
            </tbody>
        </table>
    );
}

export default Progress;
