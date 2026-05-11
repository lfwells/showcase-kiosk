const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getInteractiveKiosks } = require('../client/src/kioskDefs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Data files
const DATA_DIR = path.join(__dirname, '../data');
const SCANS_FILE = path.join(DATA_DIR, 'scans.json');
const KIOSKS_FILE = path.join(DATA_DIR, 'kiosks.json');
const DRAW_ENTRIES_FILE = path.join(DATA_DIR, 'draw_entries.json');

// Ensure data dir and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(SCANS_FILE)) {
  fs.writeFileSync(SCANS_FILE, '[]');
}
if (!fs.existsSync(KIOSKS_FILE)) {
  fs.writeFileSync(KIOSKS_FILE, '{}');
}

// Helpers
const getScans = () => JSON.parse(fs.readFileSync(SCANS_FILE, 'utf8'));
const saveScans = (data) => fs.writeFileSync(SCANS_FILE, JSON.stringify(data, null, 2));
const getKiosks = () => JSON.parse(fs.readFileSync(KIOSKS_FILE, 'utf8'));
const saveKiosks = (data) => fs.writeFileSync(KIOSKS_FILE, JSON.stringify(data, null, 2));
const getDrawEntries = () => JSON.parse(fs.readFileSync(DRAW_ENTRIES_FILE, 'utf8'));
const saveDrawEntries = (data) => fs.writeFileSync(DRAW_ENTRIES_FILE, JSON.stringify(data, null, 2));

// In-memory tracker for connected kiosks to mark them online/offline
const activeConnections = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register_kiosk', (kioskId) => {
    socket.kioskId = kioskId;
    activeConnections[socket.id] = kioskId;

    // Ensure kiosk exists in db
    const kiosks = getKiosks();
    if (!kiosks[kioskId]) {
      kiosks[kioskId] = { isValid: false }; // default
    }
    kiosks[kioskId].isOnline = true;
    saveKiosks(kiosks);

    io.emit('kiosks_update', getKiosks());
    console.log(`Kiosk ${kioskId} registered`);
  });

  socket.on('kiosk_status_update', ({ kioskId, isValid }) => {
    const kiosks = getKiosks();
    if (!kiosks[kioskId]) {
      kiosks[kioskId] = {};
    }
    kiosks[kioskId].isValid = isValid;
    saveKiosks(kiosks);

    io.emit('kiosks_update', getKiosks());
    console.log(`Kiosk ${kioskId} status updated to valid: ${isValid}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.kioskId) {
      const kiosks = getKiosks();
      if (kiosks[socket.kioskId]) {
        kiosks[socket.kioskId].isOnline = false;
        saveKiosks(kiosks);
        io.emit('kiosks_update', getKiosks());
      }
      delete activeConnections[socket.id];
    }
  });
});

// API Endpoints
app.post('/api/scan', (req, res) => {
  const { fobID, kioskID } = req.body;

  if (!fobID || !kioskID) {
    return res.status(400).json({ error: 'Missing fobID or kioskID' });
  }

  //at this point, work out if this fob has entered the draw
  const drawEntries = getDrawEntries();
  const hasEnteredDraw = drawEntries.some((entry) => entry.fobID === fobID);
  if (hasEnteredDraw) {
    return res.status(400).json({ error: 'Fob has already entered the draw' });
  }

  const kiosks = getKiosks();
  const kiosk = kiosks[kioskID] || { isValid: false, isOnline: false };

  const scanRecord = {
    fobID,
    kioskID,
    isValid: kiosk.isValid,
    timestamp: new Date().toISOString()
  };

  const scans = getScans();
  scans.unshift(scanRecord); // Add to beginning (most recent first)
  saveScans(scans);

  // Emit to everyone so dashboard updates
  io.emit('scans_update', scans);

  // Also emit a specific event for that kiosk if it's listening
  io.emit(`scan_result_${kioskID}`, scanRecord);

  res.json({ success: true, scan: scanRecord, isValid: kiosk.isValid });
});

app.get('/api/scans', (req, res) => {
  res.json(getScans());
});

app.get('/api/kiosks', (req, res) => {
  res.json(getKiosks());
});

//a post endpoint for appweb kiosk
app.post('/kiosk/appweb/validate', (req, res) => {
  console.log('Validating appweb kiosk via secret endpoint!');
  const kioskId = 'appweb';
  const kiosks = getKiosks();
  if (!kiosks[kioskId]) kiosks[kioskId] = {};
  kiosks[kioskId].isValid = true;
  saveKiosks(kiosks);
  io.emit('kiosks_update', getKiosks());
  io.emit('kiosk_appweb_validated'); // A custom event specifically for the appweb component
  res.json({ success: true, message: "Kiosk 'appweb' is now valid for 20 seconds." });
});

//a post endpoint that can change the state of a kiosk to valid
app.post('/kiosk/:kioskId/validate', (req, res) => {
  console.log('Validating kiosk:', req.params.kioskId);
  const { kioskId } = req.params;
  const kiosks = getKiosks();
  if (kiosks[kioskId]) {
    kiosks[kioskId].isValid = true;
    saveKiosks(kiosks);
    io.emit('kiosks_update', getKiosks());
    io.emit('kiosk_' + kioskId + '_validated'); // A custom event specifically for the appweb component
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kiosk not found' });
  }
});
app.get('/kiosk/:kioskId/validate', (req, res) => {
  console.log('Validating kiosk:', req.params.kioskId);
  const { kioskId } = req.params;
  const kiosks = getKiosks();
  if (kiosks[kioskId]) {
    kiosks[kioskId].isValid = true;
    saveKiosks(kiosks);
    io.emit('kiosks_update', getKiosks());
    io.emit('kiosk_' + kioskId + '_validated'); // A custom event specifically for the appweb component
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kiosk not found' });
  }
});
//a post endpoint that can change the state of a kiosk to invalid
app.post('/api/kiosk/:kioskId/invalidate', (req, res) => {
  console.log('Invalidating kiosk:', req.params.kioskId);
  const { kioskId } = req.params;
  const kiosks = getKiosks();
  if (kiosks[kioskId]) {
    kiosks[kioskId].isValid = false;
    saveKiosks(kiosks);
    io.emit('kiosks_update', getKiosks());
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Kiosk not found' });
  }
});

//an endpoint that will display the user's progress
app.get('/api/progress/:fobID', (req, res) => {
  const { fobID } = req.params;
  const scans = getScans();
  const userScans = scans.filter((scan) => scan.fobID === fobID);
  res.json(userScans);
});

//an endpoint to enter the draw to win a prize
app.post('/api/enterDraw', (req, res) => {
  const { fobID } = req.body;
  const scans = getScans();
  const userScans = scans.filter((scan) => scan.fobID === fobID && scan.isValid == true);
  let success = false;
  const interactiveKiosksCount = getInteractiveKiosks().length;
  if (userScans.length >= interactiveKiosksCount) {
    success = true;
  }

  const DRAW_ENTRIES_FILE = path.join(DATA_DIR, 'draw_entries.json');

  if (!fs.existsSync(DRAW_ENTRIES_FILE)) {
    fs.writeFileSync(DRAW_ENTRIES_FILE, '[]');
  }

  const drawEntries = getDrawEntries();
  if (success) {
    drawEntries.push({ fobID, timestamp: new Date().toISOString(), ...req.body });
    saveDrawEntries(drawEntries);
  }
  res.json({ success });
});

// Serve frontend and Unity builds
const CLIENT_BUILD_PATH = path.join(__dirname, '../client/dist');

app.use(express.static(CLIENT_BUILD_PATH, {
  setHeaders: (res, filePath) => {
    // 1. Handle Gzip decompression headers for Unity
    if (filePath.endsWith('.gz')) {
      res.set('Content-Encoding', 'gzip');
    }

    // 2. Map the correct Content-Types for compressed Unity files
    // This ensures the browser knows how to execute the decompressed content
    if (filePath.endsWith('.js.gz')) {
      res.set('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.wasm.gz')) {
      res.set('Content-Type', 'application/wasm');
    } else if (filePath.endsWith('.data.gz')) {
      res.set('Content-Type', 'application/octet-stream');
    } else if (filePath.endsWith('.symbols.json.gz')) {
      res.set('Content-Type', 'application/json');
    }
  }
}));

// Fallback for React Router (Single Page Application support)
app.use((req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
