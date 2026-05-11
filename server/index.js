const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

  res.json({ success: true, scan: scanRecord });
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
app.post('/api/kiosk/:kioskId/validate', (req, res) => {
  console.log('Validating kiosk:', req.params.kioskId);
  const { kioskId } = req.params;
  const kiosks = getKiosks();
  if (kiosks[kioskId]) {
    kiosks[kioskId].isValid = true;
    saveKiosks(kiosks);
    io.emit('kiosks_update', getKiosks());
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

// Serve frontend if in production
const CLIENT_BUILD_PATH = path.join(__dirname, '../client/dist');
app.use(express.static(CLIENT_BUILD_PATH));
app.use((req, res) => {
  res.sendFile(path.join(CLIENT_BUILD_PATH, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
