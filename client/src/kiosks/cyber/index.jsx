import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';

export default function CyberKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const [outputCode, setOutputCode] = useState('');
  const [inputCypher, setInputCypher] = useState('0');


  const [key, setKey] = useState('');
  const [rotatedNumber, setRotatedNumber] = useState(0);
  const words = [
    "apple",
    "banana",
    "cherry",
    "date",
    "elderberry",
    "fig",
    "grape",
    "honeydew",
    "kiwi",
    "lemon",
    "mango",
    "nectarine",
    "orange",
    "papaya",
    "quince",
    "raspberry",
    "strawberry",
    "tangerine",
    "ugli",
    "watermelon",
    "cantaloupe",
    "guava",
    "lime",
    "pineapple",
    "strawberry"
  ];

  function init() {
    // 1. Generate local values
    let number = Math.round(Math.random() * 25);
    let randomIndex = Math.floor(Math.random() * words.length);
    let word = words[randomIndex];

    // 2. Update state for later use in the UI
    setRotatedNumber(number);
    setKey(word);
    setInputCypher("0");

    // 3. Use the LOCAL 'word' and 'number', not the state versions
    const rotated = rotate(word, number);
    setOutputCode(rotated);

    console.log({ word, number, rotated });
  }

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    // Listen for the custom event from the server when the hidden endpoint is hit
    const handleValidated = () => {
      setIsValid(true);
      setTimeLeft(20);

      // Notify server we're officially valid (though endpoint did this too)
      socket.emit('kiosk_status_update', { kioskId, isValid: true });
    };

    socket.on('kiosk_appweb_validated', handleValidated);
    return () => socket.off('kiosk_appweb_validated', handleValidated);
  }, [kioskId, socket]);

  useEffect(() => {
    if (timeLeft > 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isValid) {
      // Time is up, invalidate
      setIsValid(false);
      socket.emit('kiosk_status_update', { kioskId, isValid: false });
      init();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isValid, kioskId, socket]);

  function handleInputChange(event) {
    setInputCypher(event.target.value);
    var number = parseInt(event.target.value);
    if (number == undefined || isNaN(number)) number = 0;


    //the output code is each of the letters on a rotation based upon the number
    setOutputCode(rotate(rotate(key, rotatedNumber), number));
  }

  function checkResult() {
    var userGuess = parseInt(inputCypher);
    if (isNaN(userGuess)) userGuess = 0;

    // The target is the negative of the original rotation
    // e.g., if we shifted +5, the user must shift -5 to get back to the start.
    var target = -rotatedNumber;

    // However, since we are using a modulo of alphabet.length (27),
    // -5 is the same as +22. Let's normalize both to a 0-26 range to be safe.
    var normalizedGuess = ((userGuess % 27) + 27) % 27;
    var normalizedTarget = ((target % 27) + 27) % 27;

    console.log({ normalizedGuess, normalizedTarget });

    if (normalizedGuess === normalizedTarget) {
      setIsValid(true);
      setTimeLeft(20);
      socket.emit('kiosk_status_update', { kioskId, isValid: true });
    } else {
      alert("Incorrect Guess");
    }
  }


  function rotate(text, n) {
    var alphabet = " abcdefghijklmnopqrstuvwxyz";
    var newText = "";

    for (var i = 0; i < text.length; i++) {
      var index = alphabet.indexOf(text[i]);

      // If the character isn't in your alphabet (like punctuation), 
      // indexOf returns -1. We should handle that.
      if (index === -1) {
        newText += text[i];
        continue;
      }

      // The Fix: (index + n % len + len) % len
      var len = alphabet.length;
      var newIndex = (index + n) % len;

      if (newIndex < 0) {
        newIndex += len;
      }

      newText += alphabet[newIndex];
    }
    return newText;
  }


  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <style>{`
        #cyberChallenge #output {
          font-size: 48pt;
          padding: 5px 10px;
          border-radius: 5px;
          color: var(--accent);
          background: var(--accent-bg);
          border: 2px solid transparent;
          transition: border-color 0.3s;
          margin-bottom: 24px;
          font-family: Courier;
          letter-spacing: 0.5em;
        }

        #cypherInput input {
          width: 75vw;
        }

        #cypherSubmit {
          padding:1em;
        }
      `}
      </style>
      <h1>Networks and Cybersecurity Kiosk</h1>
      <p>This kiosk is currently <strong>{isValid ? 'VALID' : 'INVALID'}</strong>.</p>

      {isValid ? (
        <div>
          <h2 style={{ color: 'green' }}>Access Granted!</h2>
          <h3>Time remaining: {timeLeft}s</h3>
          <p>Scan as many fobs as you like before time runs out!</p>
        </div>
      ) : (
        <div>
          <h2 style={{ color: 'red' }}>Access Denied</h2>
          <p>Find a way to unlock this kiosk...</p>
        </div>
      )}

      <div id="cyberChallenge">
        <div id="output">{outputCode}</div>
        <div id="cypherInput"><input type="range" min="0" max="25" value={inputCypher} onChange={handleInputChange} /> {inputCypher}</div>
        <div id="cypherSubmit"><input type="button" value="Check" onClick={() => checkResult()} /></div>
      </div>


      <ScanProgress socket={socket} kioskId={kioskId} />

    </div>
  );
}
