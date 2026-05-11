/**
 * Central kiosk definitions.
 * Each key is the kiosk ID (must match the folder name in src/kiosks/ for interactive kiosks).
 * `name` is the human-readable display name.
 * `type` can be:
 *   - 'interactive'  – a normal activity kiosk (has its own component in src/kiosks/<id>/)
 *   - 'status'       – the special status kiosk that shows a fob's progress
 */
const KIOSK_DEFS = {
  kiosk1: { name: 'Trivia Challenge', type: 'interactive' },
  kiosk2: { name: 'Information Desk', type: 'interactive' },
  appweb: { name: 'AppWeb Hack Challenge', type: 'interactive' },
  cyber: { name: 'Cybersecurity Challenge', type: 'interactive' },
  status: { name: 'Fob Status Check', type: 'status' },
};

/**
 * Returns only the interactive kiosks (excludes status kiosk).
 */
export function getInteractiveKiosks() {
  return Object.entries(KIOSK_DEFS).filter(([, def]) => def.type === 'interactive');
}

/**
 * Returns all kiosks.
 */
export function getAllKiosks() {
  return Object.entries(KIOSK_DEFS);
}

/**
 * Get human-readable name for a kiosk ID, with fallback.
 */
export function getKioskName(kioskId) {
  return KIOSK_DEFS[kioskId]?.name ?? kioskId;
}

export default KIOSK_DEFS;
