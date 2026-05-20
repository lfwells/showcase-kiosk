import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';
import KioskStatus from '../../components/KioskStatus';

export default function CyberKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const [cipherText, setCipherText] = useState("");
  const [plainText, setPlainText] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [inputText, setInputText] = useState("");

  const [w, setW] = useState(7);
  const [h, setH] = useState(4);

  const [columnOrder, setColumnOrder] = useState([4, 3, 1, 2, 5, 6, 7]);

  function decryptText(cipherText, width, height, order) {
    const matrix = [];
    let index = 0;

    // Build the matrix column by column (reading the cipher text)
    for (let i = 0; i < width; i++) {
      matrix[i] = [];
      for (let j = 0; j < height; j++) {
        matrix[i][j] = cipherText[index];
        index++;
      }
    }

    let result = "";

    // Reconstruct the plaintext by reading row by row according to the original order
    for (let i = 0; i < width * height; i++) {
      // Determine the original column index and map it to the matrix
      const colIndex = order[i % width] - 1;
      const rowIndex = Math.floor(i / width);

      let char = matrix[colIndex][rowIndex];

      // Fallback to lowercase 'x' to match the encryption padding
      if (char === undefined || char === null) {
        char = "x";
      }

      result += char;
    }

    return result;
  }

  function encryptText(plainText, width, height, order) {
    let plain = plainText.replaceAll(" ", "");//normaliseText(plaintext);
    const needed = width * height;

    // Truncate if the string is longer than the grid size
    if (plain.length > needed) {
      plain = plain.substring(0, needed);
    }

    // Pad with 'x' to fill the grid (PHP's str_pad pads to the right by default)
    plain = plain.padEnd(needed, "x");


    const grid = [];
    let pos = 0;

    // Populate the 2D grid
    for (let row = 0; row < height; row++) {
      grid[row] = []; // Explicitly initialize the inner array in JS
      for (let col = 0; col < width; col++) {
        grid[row][col] = plain[pos++];
      }
    }
    console.log({ grid, plain });

    let cipher = "";

    // Read columns based on the order sequence
    for (let n = 1; n <= width; n++) {
      const col = order.indexOf(n);
      for (let row = 0; row < height; row++) {
        cipher += grid[row][col];
      }
    }

    return cipher;
  }

  const phrases = [
    "attack postponed until two am",
    "update your software",
    "use strong passwords",
    "turn on multifactor authentication",
    "think before you click",
    "back up important files",
    "lock your screen",
    "check the sender first",
    "do not reuse passwords",
    "report suspicious emails",
    "protect your personal data",
    "use a password manager",
    "verify before you trust"
  ];



  function init() {
    var randomIndex = Math.floor(Math.random() * phrases.length);
    const sentence = phrases[randomIndex];
    // 1. Clean the sentence (matching your encryptText logic)
    const plainText = sentence.replaceAll(" ", "");

    // 2. Pick a random width (e.g., between 4 and 8)
    const minWidth = 4;
    const maxWidth = 8;
    const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;

    // 3. Calculate the exact height needed to hold the string
    const height = Math.ceil(plainText.length / width);

    // 4. Generate an array from 1 to 'width' [1, 2, 3...]
    const order = Array.from({ length: width }, (_, i) => i + 1);

    // 5. Shuffle the order array randomly (Fisher-Yates shuffle)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    setW(width);
    setH(height);
    setColumnOrder(order);

    console.log("for cheating: ", encryptText(sentence, width, height, order));
    setPlainText(sentence);
    setCipherText(encryptText(sentence, width, height, order));
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
    let value = event.target.value;
    setInputText(value);

    value = value.toLowerCase();
    value = value.replaceAll(" ", "");
    let decrypt = encryptText(value, w, h, columnOrder);
    setDecryptedText(decrypt);
    if (value.toLowerCase().replaceAll(" ", "") == plainText.toLowerCase().replaceAll(" ", "")) {
      setIsValid(true);
      setTimeLeft(20);
      socket.emit('kiosk_status_update', { kioskId, isValid: true });

      //attackpostedponeduntiltwoam
      //attackpostponeduntiltwoam
    }
    return;
    //old one for now
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
          font-size: 32pt;
          font-family: 'Courier New', Courier, monospace;
          text-align: center;
          letter-spacing: 2pt;
          padding: 5px 10px;
          border-radius: 5px;
          color: var(--accent);
          background: var(--accent-bg);
          border: 2px solid black;
          transition: border-color 0.3s;
          margin-bottom: 24px;
          font-family: Courier;
          letter-spacing: 0.5em;
          margin-top:1em;
        }

        #cypherInput input {
          width: 75vw;
        }

        #cypherSubmit {
          padding:1em;
        }

        code { font-size:32pt }
      `}
      </style>

      <KioskStatus
        isValid={isValid}
        timeLeft={timeLeft}
        title="Networks and Cybersecurity Kiosk"
        desc="Complete the Challenge to Unlock the Kiosk"
      >
      </KioskStatus>

      <div id="cyberChallenge">
        <div><strong>Ciper Text:</strong></div>
        <div className="cipherText">{cipherText}</div>
        <div><strong>W</strong>: <code>{w}</code> <strong>H</strong>: <code>{h}</code> <strong>Column Order</strong>: <code>{columnOrder.join(", ")}</code></div>

        <div><textarea id="output" className="inputText" value={inputText} onChange={handleInputChange} rows="3" placeholder='Enter Secret Message' /></div>
        <div className="cipherText">{decryptedText}</div>
      </div>

      <ScanProgress socket={socket} kioskId={kioskId} />

    </div>
  );
}

