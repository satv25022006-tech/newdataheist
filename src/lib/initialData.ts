import { CaseItem, CaseEvidence, Suspect, Question } from '../types';

export const INITIAL_CASES: CaseItem[] = [
  {
    id: 'case-mk-cyber',
    caseCode: 'mk',
    title: 'Operation MK: Cyber Crime Syndicate',
    acronym: 'jw',
    summary: 'Analyze digital and physical artifacts to solve the bureau case.',
    incidentDescription: 'At 02:40 hours, automated deep-packet telemetry alerted SMIT Centrak Forensic Crime Bureau of an anomalous exfiltration tunnel penetrating core encrypted subnets. Rogue payloads compromised biometric gateway nodes. Investigators recovered encrypted memory dumps, cloned RFID credentials, and electromagnetic pulse residue.',
    briefing: 'Analyze digital and physical artifacts to solve the bureau case. Inspect forensic evidence posters, examine raw hex dumps, decrypt steganographic channels, and identify the rogue syndicate operative before extraction.',
    status: 'published',
    category: 'Cyber Crime Investigation',
    badgeTag: 'CYBER FORENSICS',
    subTag: 'Active Tournament',
    estimatedMinutes: 15,
    rulesTimerSeconds: 120,
    briefingTimerSeconds: 180,
    timeLimitSeconds: 90,
    questionsPerLevel: 3,
    starThresholds: {
      oneStarMin: 1,
      twoStarMin: 2,
      threeStarMin: 3,
    },
    retriesAllowed: true,
    bannerGradient: 'from-sky-950 via-slate-900 to-cyan-950',
    targets: [
      {
        id: 'target-1',
        label: 'TARGET 1: EVIDENCE',
        description: 'Inspect forensic posters, network topologies, and evidence frames.'
      },
      {
        id: 'target-2',
        label: 'TARGET 2: DECRYPTION',
        description: 'Detect cloned RFID badges, spectral toxins, and rogue payloads.'
      },
      {
        id: 'target-3',
        label: 'TARGET 3: NEUTRALIZE',
        description: 'Disarm laser arrays and intercept the getaway craft before extraction.'
      }
    ],
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-12T07:30:00Z',
  },
  {
    id: 'case-blackwood-ruby',
    caseCode: 'BK7',
    title: 'The Vanishing of the Blackwood Ruby',
    acronym: 'vr',
    summary: 'A 45-carat heirloom vanished from a sealed second-floor gallery during the autumn gala. Three suspects, one broken timepiece.',
    incidentDescription: 'At approximately 23:45, during Lord Blackwood\'s annual autumnal gala, the priceless Blackwood Ruby was discovered missing from its reinforced glass display pedestal on the second-floor gallery. The gallery had been locked from the inside, and the only terrace balcony door was secured with an antique slide bolt. The alarm wires were clipped cleanly with jeweler shears.',
    briefing: 'Inspect forensic posters and macro photographs of the terrace downspout, fractured timepiece, and duplicate key casts to trace the syndicate collaboration.',
    status: 'published',
    category: 'Physical & Grand Larceny',
    badgeTag: 'PHYSICAL FORENSICS',
    subTag: 'Classified File',
    estimatedMinutes: 12,
    rulesTimerSeconds: 120,
    briefingTimerSeconds: 180,
    timeLimitSeconds: 90,
    questionsPerLevel: 3,
    starThresholds: {
      oneStarMin: 1,
      twoStarMin: 2,
      threeStarMin: 3,
    },
    retriesAllowed: true,
    bannerGradient: 'from-amber-950 via-slate-900 to-slate-950',
    targets: [
      {
        id: 'target-1',
        label: 'TARGET 1: EVIDENCE',
        description: 'Analyze dropped timepiece balance wheel impact velocity and chalk dust.'
      },
      {
        id: 'target-2',
        label: 'TARGET 2: DECRYPTION',
        description: 'Decode butler pantry serving log discrepancies during the ballroom toast.'
      },
      {
        id: 'target-3',
        label: 'TARGET 3: NEUTRALIZE',
        description: 'Identify the inside conspirator who duplicated the paraffin master key.'
      }
    ],
    createdAt: '2026-10-02T11:00:00Z',
    updatedAt: '2026-10-12T07:30:00Z',
  }
];

export const INITIAL_EVIDENCE: CaseEvidence[] = [
  {
    id: 'ev-mk-01',
    caseId: 'case-mk-cyber',
    evidenceCode: 'EXHIBIT #1',
    title: 'Cloned Mifare RFID Keycard',
    description: 'Hardware sniffer capture showing a duplicate 13.56MHz transmission beacon matching Chief Archivist badge signatures.',
    category: 'digital',
    analysisNotes: 'Cloned badge was generated using a high-frequency SDR transceiver within 1.5 meters range.',
  },
  {
    id: 'ev-mk-02',
    caseId: 'case-mk-cyber',
    evidenceCode: 'EXHIBIT #2',
    title: 'Rogue Memory Payload Hex Dump',
    description: 'Kernel ring buffer dump extracted from Gateway node 04 containing inverted XOR encryption headers.',
    category: 'digital',
    analysisNotes: 'Contains compiler timestamp matching internal workstation 12-B.',
  },
  {
    id: 'ev-mk-03',
    caseId: 'case-mk-cyber',
    evidenceCode: 'EXHIBIT #3',
    title: 'Spectral Chemical Residue',
    description: 'Aerosol coolant traces discovered across the infrared volumetric sensor array.',
    category: 'physical',
    analysisNotes: 'Fluorocarbon coolant suppressed thermal gradient detection for exactly 94 seconds.',
  }
];

export const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: 'susp-mk-01',
    caseId: 'case-mk-cyber',
    name: 'Dr. Aris Thorne',
    role: 'Lead Cryptographic Architect',
    alibi: 'Claims remote terminal session was running from his off-grid residence.',
    motive: 'Denied equity rights in the quantum encryption patent.',
    statement: 'The intrusion signatures reflect an inside architecture leak that only my former lab supervisor knew.',
    suspicionScore: 8,
  },
  {
    id: 'susp-mk-02',
    caseId: 'case-mk-cyber',
    name: 'Kaelen Vance',
    role: 'Infrastructure Security Officer',
    alibi: 'Monitored floor 2 server corridors until biometric sensor disconnect.',
    motive: 'Imminent personal debt to an offshore cryptowallet syndicate.',
    statement: 'The cooling spray blinded the sensor cluster; by the time alarms tripped, the pod was empty.',
    suspicionScore: 9,
  }
];

// Helper to generate SVG evidence poster data URL
function createSvgPoster(title: string, subtitle: string, code: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#070d1d"/>
        <stop offset="50%" stop-color="#0c1833"/>
        <stop offset="100%" stop-color="#050814"/>
      </linearGradient>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e3a66" stroke-width="0.75" opacity="0.3"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <rect x="20" y="20" width="760" height="360" rx="8" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.6"/>
    <circle cx="70" cy="70" r="30" fill="${color}" fill-opacity="0.1" stroke="${color}" stroke-width="1.5"/>
    <path d="M 70 50 L 70 90 M 50 70 L 90 70" stroke="${color}" stroke-width="1.5"/>
    <text x="120" y="65" font-family="monospace" font-size="12" fill="${color}" letter-spacing="3">FORENSIC EVIDENCE POSTER // ${code}</text>
    <text x="120" y="90" font-family="sans-serif" font-weight="bold" font-size="20" fill="#f8fafc">${title}</text>
    <rect x="40" y="130" width="720" height="180" rx="6" fill="#040711" fill-opacity="0.7" stroke="#1e293b"/>
    <text x="60" y="170" font-family="monospace" font-size="13" fill="#38bdf8">&gt; CLASSIFICATION: CONFIDENTIAL FORENSIC EXHIBIT</text>
    <text x="60" y="200" font-family="monospace" font-size="12" fill="#94a3b8">&gt; TIMELAPSE: 02:40:19.488 UTC // SPECTRAL ANOMALY VERIFIED</text>
    <text x="60" y="230" font-family="sans-serif" font-size="14" fill="#e2e8f0">${subtitle}</text>
    <line x1="60" y1="260" x2="720" y2="260" stroke="#1e3a8a" stroke-width="1"/>
    <text x="60" y="285" font-family="monospace" font-size="11" fill="#64748b">SMIT CENTRAK CRIME BUREAU // DEPT OF CYBER INQUIRIES // VERIFIED ARTIFACT</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_QUESTIONS: Question[] = [
  // Case MK - Easy Level (Exhibit 1, 2, 3)
  {
    id: 'q-mk-e1',
    caseId: 'case-mk-cyber',
    level: 'easy',
    orderNumber: 1,
    prompt: 'Examine Forensic Exhibit #1. What frequency beacon confirmed the rogue hardware sniffer captured the victim\'s RFID credentials?',
    hint: 'Review the high-frequency Mifare standard cited in the Exhibit #1 analysis report.',
    explanation: 'Exhibit #1 forensic telemetry confirms a 13.56 MHz transmission beacon cloned from the proximity card reader.',
    evidenceRef: 'EXHIBIT #1',
    posterTitle: 'Forensic Evidence Poster: Exhibit #1 RFID Sniffer',
    posterUrl: createSvgPoster('Exhibit #1: 13.56MHz RFID Cloned Badge Beacon', 'Transceiver captured proximity handshake at 02:40:19 UTC within 1.5m radius', 'EXHIBIT #1', '#38bdf8'),
    correctOptionLabel: 'B',
    options: [
      { id: 'opt-mk-e1-a', questionId: 'q-mk-e1', optionLabel: 'A', optionText: '125 kHz low-frequency legacy magnetic beacon' },
      { id: 'opt-mk-e1-b', questionId: 'q-mk-e1', optionLabel: 'B', optionText: '13.56 MHz high-frequency Mifare near-field handshake' },
      { id: 'opt-mk-e1-c', questionId: 'q-mk-e1', optionLabel: 'C', optionText: '2.4 GHz industrial telemetry spectrum' },
      { id: 'opt-mk-e1-d', questionId: 'q-mk-e1', optionLabel: 'D', optionText: '433 MHz garage transmitter protocol' },
    ]
  },
  {
    id: 'q-mk-e2',
    caseId: 'case-mk-cyber',
    level: 'easy',
    orderNumber: 2,
    prompt: 'Examine Forensic Exhibit #2. Which workstation compiler signature matches the kernel ring buffer memory payload?',
    hint: 'Check the compiler timestamp in the memory dump metadata.',
    explanation: 'The memory dump header matches workstation 12-B assigned to Security Officer Kaelen Vance.',
    evidenceRef: 'EXHIBIT #2',
    posterTitle: 'Forensic Evidence Poster: Exhibit #2 Memory Dump',
    posterUrl: createSvgPoster('Exhibit #2: Kernel Ring Buffer Inverted XOR Hex', 'Compiler header timestamp correlates directly to internal engineering node 12-B', 'EXHIBIT #2', '#06b6d4'),
    correctOptionLabel: 'C',
    options: [
      { id: 'opt-mk-e2-a', questionId: 'q-mk-e2', optionLabel: 'A', optionText: 'Public internet proxy node in Geneva' },
      { id: 'opt-mk-e2-b', questionId: 'q-mk-e2', optionLabel: 'B', optionText: 'Automated cloud build container #09' },
      { id: 'opt-mk-e2-c', questionId: 'q-mk-e2', optionLabel: 'C', optionText: 'Internal engineering workstation 12-B' },
      { id: 'opt-mk-e2-d', questionId: 'q-mk-e2', optionLabel: 'D', optionText: 'External cellular hotspot connection' },
    ]
  },
  {
    id: 'q-mk-e3',
    caseId: 'case-mk-cyber',
    level: 'easy',
    orderNumber: 3,
    prompt: 'Examine Forensic Exhibit #3. For how many seconds did the fluorocarbon chemical aerosol blind the volumetric infrared sensors?',
    hint: 'Check the laboratory gas chromatography duration estimate.',
    explanation: 'Exhibit #3 details that the chemical coolant blinded the sensor cluster for exactly 94 seconds.',
    evidenceRef: 'EXHIBIT #3',
    posterTitle: 'Forensic Evidence Poster: Exhibit #3 Chemical Spectrogram',
    posterUrl: createSvgPoster('Exhibit #3: Fluorocarbon Thermal Blind Spectrogram', 'Thermal gradient blinded infrared sensor grid for an exact window of 94 seconds', 'EXHIBIT #3', '#a855f7'),
    correctOptionLabel: 'A',
    options: [
      { id: 'opt-mk-e3-a', questionId: 'q-mk-e3', optionLabel: 'A', optionText: '94 seconds during the guard rotation window' },
      { id: 'opt-mk-e3-b', questionId: 'q-mk-e3', optionLabel: 'B', optionText: '15 seconds during electrical power surge' },
      { id: 'opt-mk-e3-c', questionId: 'q-mk-e3', optionLabel: 'C', optionText: '300 seconds throughout the night shift' },
      { id: 'opt-mk-e3-d', questionId: 'q-mk-e3', optionLabel: 'D', optionText: '0 seconds because the sensors were deactivated' },
    ]
  },

  // Case MK - Medium Level
  {
    id: 'q-mk-m1',
    caseId: 'case-mk-cyber',
    level: 'medium',
    orderNumber: 1,
    prompt: 'Cross-reference Exhibits #1 & #2: How did the intruder bypass physical two-factor biometric verification at Vault Chamber Delta?',
    hint: 'Synthesize the RFID beacon with the cooling spray.',
    explanation: 'The perpetrator presented the cloned 13.56MHz badge while simultaneously deploying the cooling aerosol to suppress the facial thermal iris detector.',
    evidenceRef: 'EXHIBIT #1 & #3',
    posterTitle: 'Forensic Evidence Poster: Biometric Bypass Analysis',
    posterUrl: createSvgPoster('Exhibit #4: Dual-Channel Biometric Bypass Vector', 'Synchronized RFID handshake paired with thermal suppression spray neutralized iris scan', 'EXHIBIT #4', '#eab308'),
    correctOptionLabel: 'D',
    options: [
      { id: 'opt-mk-m1-a', questionId: 'q-mk-m1', optionLabel: 'A', optionText: 'Cut electrical main cables from the basement substation' },
      { id: 'opt-mk-m1-b', questionId: 'q-mk-m1', optionLabel: 'B', optionText: 'Drilled through the vault steel casing using a diamond laser' },
      { id: 'opt-mk-m1-c', questionId: 'q-mk-m1', optionLabel: 'C', optionText: 'Guards voluntarily opened the gate for an unlogged delivery' },
      { id: 'opt-mk-m1-d', questionId: 'q-mk-m1', optionLabel: 'D', optionText: 'Coupled the cloned RFID keycard with thermal aerosol suppression' },
    ]
  },
  {
    id: 'q-mk-m2',
    caseId: 'case-mk-cyber',
    level: 'medium',
    orderNumber: 2,
    prompt: 'Examine suspect alibis: Why is Kaelen Vance\'s testimony regarding the biometric sensor disconnect contradicted by network logs?',
    hint: 'Compare his claim of being in floor 2 corridors with server node telemetry.',
    explanation: 'Network telemetry logs prove node 12-B was actively compiling the exploit payload precisely when Vance claimed he was patrolling.',
    evidenceRef: 'EXHIBIT #2 & Suspect Alibi',
    posterTitle: 'Forensic Evidence Poster: Timeline Discrepancy Matrix',
    posterUrl: createSvgPoster('Exhibit #5: Chronological Telemetry Matrix', 'Active session on Vance terminal at 02:40 contradicts claimed physical foot patrol', 'EXHIBIT #5', '#ec4899'),
    correctOptionLabel: 'B',
    options: [
      { id: 'opt-mk-m2-a', questionId: 'q-mk-m2', optionLabel: 'A', optionText: 'He was captured buying coffee at an airport terminal' },
      { id: 'opt-mk-m2-b', questionId: 'q-mk-m2', optionLabel: 'B', optionText: 'His engineering node was actively compiling the exploit script during his claimed patrol' },
      { id: 'opt-mk-m2-c', questionId: 'q-mk-m2', optionLabel: 'C', optionText: 'His security badge was scanned entering the cafeteria' },
      { id: 'opt-mk-m2-d', questionId: 'q-mk-m2', optionLabel: 'D', optionText: 'He had surrendered his security keys the previous morning' },
    ]
  },
  {
    id: 'q-mk-m3',
    caseId: 'case-mk-cyber',
    level: 'medium',
    orderNumber: 3,
    prompt: 'Forensic payload disassembly: What was the secondary objective embedded within the rogue memory payload?',
    hint: 'Look for exfiltration routes or wiper commands.',
    explanation: 'The reverse-engineered payload contained instructions to purge database audit logs immediately after data transmission.',
    evidenceRef: 'EXHIBIT #2',
    posterTitle: 'Forensic Evidence Poster: Rogue Payload Decompiler',
    posterUrl: createSvgPoster('Exhibit #6: Disassembled Wiper Instruction Set', 'Post-exfiltration wipe directive identified in subroutine 0x7F40', 'EXHIBIT #6', '#f43f5e'),
    correctOptionLabel: 'A',
    options: [
      { id: 'opt-mk-m3-a', questionId: 'q-mk-m3', optionLabel: 'A', optionText: 'Purge local database audit logs to erase evidence of the exfiltration route' },
      { id: 'opt-mk-m3-b', questionId: 'q-mk-m3', optionLabel: 'B', optionText: 'Mine cryptocurrency across the corporate mainframe nodes' },
      { id: 'opt-mk-m3-c', questionId: 'q-mk-m3', optionLabel: 'C', optionText: 'Transmit email spam to all registered bureau agents' },
      { id: 'opt-mk-m3-d', questionId: 'q-mk-m3', optionLabel: 'D', optionText: 'Overclock the server cooling fan array to cause a fire' },
    ]
  },

  // Case MK - Hard Level
  {
    id: 'q-mk-h1',
    caseId: 'case-mk-cyber',
    level: 'hard',
    orderNumber: 1,
    prompt: 'Hard Forensic Synthesis: Who orchestrated the inside breach, and what physical artifact ties them directly to the syndicate?',
    hint: 'Synthesize the workstation compiler, chemical spray access, and debt motive.',
    explanation: 'Kaelen Vance orchestrated the breach using workstation 12-B and facility chemical coolant supplies to satisfy an offshore syndicate debt.',
    evidenceRef: 'All Exhibits & Suspects',
    posterTitle: 'Forensic Evidence Poster: Syndicate Culprit Linkage',
    posterUrl: createSvgPoster('Exhibit #7: Culprit Linkage & Offshore Wallet', 'Physical access, fluorocarbon spray inventory, and workstation 12-B pin Vance', 'EXHIBIT #7', '#10b981'),
    correctOptionLabel: 'C',
    options: [
      { id: 'opt-mk-h1-a', questionId: 'q-mk-h1', optionLabel: 'A', optionText: 'Dr. Aris Thorne working alone from his off-grid cottage' },
      { id: 'opt-mk-h1-b', questionId: 'q-mk-h1', optionLabel: 'B', optionText: 'An external hacker group with zero inside access' },
      { id: 'opt-mk-h1-c', questionId: 'q-mk-h1', optionLabel: 'C', optionText: 'Kaelen Vance, who weaponized workstation 12-B and facility coolant supplies' },
      { id: 'opt-mk-h1-d', questionId: 'q-mk-h1', optionLabel: 'D', optionText: 'The bank chief executive staging an insurance write-off' },
    ]
  },
  {
    id: 'q-mk-h2',
    caseId: 'case-mk-cyber',
    level: 'hard',
    orderNumber: 2,
    prompt: 'Decryption Final: Where was the exfiltrated cryptographic cipher payload staged for extraction before police cordoned the perimeter?',
    hint: 'Review the getaway vector in the Case Target 3 briefing.',
    explanation: 'The encrypted payload was transferred to an unmanned drone relay parked on the HVAC roof cooling tower.',
    evidenceRef: 'TARGET 3 BRIEFING',
    posterTitle: 'Forensic Evidence Poster: Extraction Vector Surveillance',
    posterUrl: createSvgPoster('Exhibit #8: Rooftop HVAC Drone Extraction Vector', 'Unmanned optical laser relay intercepted on the HVAC cooling tower deck', 'EXHIBIT #8', '#00f0ff'),
    correctOptionLabel: 'B',
    options: [
      { id: 'opt-mk-h2-a', questionId: 'q-mk-h2', optionLabel: 'A', optionText: 'Stored on a USB drive buried in the visitor parking lot' },
      { id: 'opt-mk-h2-b', questionId: 'q-mk-h2', optionLabel: 'B', optionText: 'Staged on an autonomous drone optical relay on the rooftop HVAC tower' },
      { id: 'opt-mk-h2-c', questionId: 'q-mk-h2', optionLabel: 'C', optionText: 'Hidden inside the cafeteria soda vending machine' },
      { id: 'opt-mk-h2-d', questionId: 'q-mk-h2', optionLabel: 'D', optionText: 'Sent via postal express mail in an envelope' },
    ]
  },
  {
    id: 'q-mk-h3',
    caseId: 'case-mk-cyber',
    level: 'hard',
    orderNumber: 3,
    prompt: 'Bureau Verdict: What definitive finding must be entered into the SMIT Centrak Forensic Crime Bureau records to officially seal Operation MK?',
    hint: 'Formal indictment charging both cyber exfiltration and physical security compromise.',
    explanation: 'Indict Kaelen Vance for espionage, unauthorized biometric bypass, and attempted syndicate exfiltration; seize the rooftop drone transceiver.',
    evidenceRef: 'OFFICIAL BUREAU PROTOCOLS',
    posterTitle: 'Forensic Evidence Poster: Bureau Indictment Order',
    posterUrl: createSvgPoster('Exhibit #9: Official Bureau Indictment Dossier', 'Operation MK successfully resolved // Evidence submitted to State Prosecutor', 'EXHIBIT #9', '#38bdf8'),
    correctOptionLabel: 'A',
    options: [
      { id: 'opt-mk-h3-a', questionId: 'q-mk-h3', optionLabel: 'A', optionText: 'Indict Kaelen Vance for treasonous biometric bypass & syndicate exfiltration' },
      { id: 'opt-mk-h3-b', questionId: 'q-mk-h3', optionLabel: 'B', optionText: 'Declare the investigation unresolved due to missing hard drives' },
      { id: 'opt-mk-h3-c', questionId: 'q-mk-h3', optionLabel: 'C', optionText: 'Arrest Dr. Aris Thorne without physical forensic corroboration' },
      { id: 'opt-mk-h3-d', questionId: 'q-mk-h3', optionLabel: 'D', optionText: 'Close the file as an accidental system configuration bug' },
    ]
  }
];
