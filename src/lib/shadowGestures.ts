/**
 * Shadow puppet gesture classification from MediaPipe hand landmarks.
 * Uses angle-based finger curl analysis — no ML model needed beyond MediaPipe.
 */

export type PuppetType = "dog" | "bird" | "bunny" | "alligator" | "peace" | "none";

export interface HandLandmark {
  x: number; // 0-1 normalized
  y: number;
  z: number;
}

export interface GestureResult {
  puppet: PuppetType;
  confidence: number;
  mouthOpen?: boolean; // for dog/alligator
  wingAngle?: number; // 0-1 for bird flap
  earWiggle?: number; // 0-1 for bunny ears
  centroid: { x: number; y: number };
  wristAngle: number; // radians
}

// MediaPipe hand landmark indices
const WRIST = 0;
const THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8;
const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_DIP = 11, MIDDLE_TIP = 12;
const RING_MCP = 13, RING_PIP = 14, RING_DIP = 15, RING_TIP = 16;
const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_DIP = 19, PINKY_TIP = 20;

function angle(a: HandLandmark, b: HandLandmark, c: HandLandmark): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  if (magBA === 0 || magBC === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return Math.acos(cos) * (180 / Math.PI);
}

function dist(a: HandLandmark, b: HandLandmark): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function fingerCurl(
  landmarks: HandLandmark[],
  mcp: number,
  pip: number,
  dip: number,
  tip: number
): number {
  // Returns 0 (fully extended) to 1 (fully curled)
  const a = angle(landmarks[mcp], landmarks[pip], landmarks[tip]);
  // Straight finger ≈ 170-180°, curled ≈ 40-80°
  return Math.max(0, Math.min(1, (180 - a) / 120));
}

function getCentroid(landmarks: HandLandmark[]): { x: number; y: number } {
  const sum = landmarks.reduce(
    (acc, l) => ({ x: acc.x + l.x, y: acc.y + l.y }),
    { x: 0, y: 0 }
  );
  return { x: sum.x / landmarks.length, y: sum.y / landmarks.length };
}

function getWristAngle(landmarks: HandLandmark[]): number {
  const wrist = landmarks[WRIST];
  const middleMcp = landmarks[MIDDLE_MCP];
  return Math.atan2(middleMcp.y - wrist.y, middleMcp.x - wrist.x);
}

export function classifyGesture(landmarks: HandLandmark[]): GestureResult {
  if (landmarks.length < 21) {
    return {
      puppet: "none",
      confidence: 0,
      centroid: { x: 0.5, y: 0.5 },
      wristAngle: 0,
    };
  }

  const centroid = getCentroid(landmarks);
  const wristAngle = getWristAngle(landmarks);

  // Calculate curl for each finger (0 = extended, 1 = curled)
  const indexCurl = fingerCurl(landmarks, INDEX_MCP, INDEX_PIP, INDEX_DIP, INDEX_TIP);
  const middleCurl = fingerCurl(landmarks, MIDDLE_MCP, MIDDLE_PIP, MIDDLE_DIP, MIDDLE_TIP);
  const ringCurl = fingerCurl(landmarks, RING_MCP, RING_PIP, RING_DIP, RING_TIP);
  const pinkyCurl = fingerCurl(landmarks, PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP);

  // Thumb: check if extended sideways
  const thumbAngle = angle(landmarks[THUMB_CMC], landmarks[THUMB_MCP], landmarks[THUMB_TIP]);
  const thumbExtended = thumbAngle > 140;

  // Mouth open: angle between thumb tip and index base
  const thumbToIndex = dist(landmarks[THUMB_TIP], landmarks[INDEX_MCP]);

  // Finger gap: distance between index and middle tips
  const indexMiddleGap = dist(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]);

  const base: Omit<GestureResult, "puppet" | "confidence"> = {
    centroid,
    wristAngle,
  };

  // ── Dog: Index + middle extended, ring + pinky curled, thumb out ──
  if (
    indexCurl < 0.35 &&
    middleCurl < 0.35 &&
    ringCurl > 0.5 &&
    pinkyCurl > 0.5 &&
    thumbExtended &&
    indexMiddleGap < 0.06
  ) {
    return {
      ...base,
      puppet: "dog",
      confidence: 0.85,
      mouthOpen: thumbToIndex > 0.08,
    };
  }

  // ── Bunny: Index + middle extended (V shape), others curled ──
  if (
    indexCurl < 0.35 &&
    middleCurl < 0.35 &&
    ringCurl > 0.5 &&
    pinkyCurl > 0.5 &&
    indexMiddleGap > 0.04
  ) {
    const earWiggle =
      Math.abs(
        landmarks[INDEX_TIP].y -
          landmarks[MIDDLE_TIP].y
      ) * 10;
    return {
      ...base,
      puppet: "bunny",
      confidence: 0.8,
      earWiggle: Math.min(1, earWiggle),
    };
  }

  // ── Bird: All fingers extended, thumb crossed ──
  if (
    indexCurl < 0.3 &&
    middleCurl < 0.3 &&
    ringCurl < 0.3 &&
    pinkyCurl < 0.3
  ) {
    // Wing angle from wrist rotation
    const wingAngle = Math.abs(
      Math.sin(
        Math.atan2(
          landmarks[MIDDLE_TIP].y - landmarks[WRIST].y,
          landmarks[MIDDLE_TIP].x - landmarks[WRIST].x
        )
      )
    );
    return {
      ...base,
      puppet: "bird",
      confidence: 0.75,
      wingAngle,
    };
  }

  // ── Alligator: Flat hand, thumb below = mouth ──
  if (
    indexCurl < 0.3 &&
    middleCurl < 0.3 &&
    ringCurl < 0.3 &&
    pinkyCurl < 0.3 &&
    indexMiddleGap < 0.04
  ) {
    return {
      ...base,
      puppet: "alligator",
      confidence: 0.7,
      mouthOpen: thumbToIndex > 0.1,
    };
  }

  // ── Peace: V sign (similar to bunny but fingers closer) ──
  if (
    indexCurl < 0.35 &&
    middleCurl < 0.35 &&
    ringCurl > 0.5 &&
    pinkyCurl > 0.5
  ) {
    return {
      ...base,
      puppet: "peace",
      confidence: 0.6,
    };
  }

  return { ...base, puppet: "none", confidence: 0 };
}

// ── SVG path data for each puppet silhouette ──
export const PUPPET_PATHS: Record<Exclude<PuppetType, "none">, string> = {
  dog: "M30,80 C30,60 40,40 60,35 C65,30 75,25 80,30 L85,20 L90,30 C95,25 100,28 100,35 C110,40 120,55 120,80 L115,85 C115,90 110,95 100,95 L50,95 C40,95 35,90 35,85 Z",
  bird: "M20,60 C25,40 40,25 60,20 C65,15 70,10 75,15 C80,10 85,12 82,20 C100,30 115,50 120,70 L110,65 L100,75 L90,65 L80,75 L70,65 C50,80 30,80 20,60 Z",
  bunny: "M45,90 C40,85 35,70 40,55 L38,15 C38,5 42,5 45,15 L48,35 L52,35 L55,15 C58,5 62,5 62,15 L60,55 C65,70 60,85 55,90 Z",
  alligator: "M15,50 L15,40 C20,35 30,30 50,30 L110,30 C120,30 125,35 125,40 L125,45 C125,48 120,50 110,50 L50,50 C30,50 20,50 15,50 Z M15,55 L15,65 C20,70 30,70 50,70 L110,70 C120,70 125,65 125,60 L125,55 C125,52 120,50 110,50 L50,50 C30,50 20,52 15,55 Z",
  peace: "M45,90 C40,85 35,70 40,55 L42,25 C42,18 46,18 46,25 L47,40 L53,40 L54,25 C54,18 58,18 58,25 L56,55 C60,70 58,85 55,90 Z",
};

// Suppress unused variable warnings for landmark constants used in gesture logic
void THUMB_IP;
void INDEX_DIP;
void MIDDLE_DIP;
void RING_DIP;
void RING_TIP;
void PINKY_DIP;
void PINKY_TIP;
void PINKY_PIP;
void RING_PIP;
