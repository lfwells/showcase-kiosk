import React, { useState, useEffect, useRef } from 'react';
import ScanProgress from '../../ScanProgress';
import KioskStatus from '../../components/KioskStatus';

export default function AIKiosk({ kioskId, socket }) {
  const [isValid, setIsValid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  function init() {
    var s = selectRandomSentence();
    setSentence(s);
    setUserInput("");
    console.log("for cheating, correct answer is", result(s).join(","), s);
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


  let vocabulary = [
    "restaurants",
    "serve",
    "delicious",
    "food",
    "in",
    "is",
    "amazing",
    "people",
    "enjoy",
    "pizza",
    "and",
    "burgers"
  ];
  let sentences = [
    "people enjoy delicious food in restaurants and pizza is delicious",
    "restaurants serve delicious food and pizza is delicious",
    "food in restaurants is amazing and burgers are amazing",
    "people enjoy delicious burgers and delicious pizza in restaurants",
    "food in restaurants is amazing and people enjoy delicious food",
    "restaurants serve delicious pizza and people enjoy delicious burgers",
  ];

  let result = (sentence) => {
    let counts = [];
    for (let i = 0; i < vocabulary.length; i++) {
      counts.push(0);
    }

    sentence = sentence.split(" ");

    for (let j = 0; j < sentence.length; j++) {
      for (let i = 0; i < vocabulary.length; i++) {
        if (sentence[j] === vocabulary[i]) {
          counts[i]++;
        }
      }
    }
    return counts;
  }

  let selectRandomSentence = () => {
    let index = Math.floor(Math.random() * sentences.length);
    return sentences[index];
  }

  const [userInput, setUserInput] = useState("");
  const [sentence, setSentence] = useState("");

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <KioskStatus
        isValid={isValid}
        timeLeft={timeLeft}
        title="Artificial Intelligence Kiosk"
        desc="Complete the Challenge to Unlock"
      />

      <ScanProgress socket={socket} kioskId={kioskId} />


      <div className="sentence">{sentence}</div>
      <input
        className="input"
        type="text"
        placeholder="Enter Code"
        value={userInput}
        onChange={(e) => {
          let value = e.target.value.toLowerCase().trim();
          setUserInput(value);
          let correct = result(sentence);
          if (value == correct.join("") || value == correct.join(" ") || value == correct.join(",") || value == correct.join(", ")) {
            setIsValid(true);
            setTimeLeft(20);
            socket.emit('kiosk_status_update', { kioskId, isValid: true });
            init();
          }
        }}
      />
    </div>
  );
}

