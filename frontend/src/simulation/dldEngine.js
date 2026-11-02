/**
 * Pure JavaScript Digital Logic Design (DLD) Simulation Engine
 * Computes exact boolean algebra, gate propagation, flip-flop state transitions,
 * synchronous counter logic, and 7-segment BCD decoding.
 */

// Basic logic gate primitives
export const NOT = (a) => (a ? 0 : 1);
export const AND = (a, b) => (a && b ? 1 : 0);
export const OR = (a, b) => (a || b ? 1 : 0);
export const XOR = (a, b) => ((a ? 1 : 0) ^ (b ? 1 : 0) ? 1 : 0);
export const NAND = (a, b) => NOT(AND(a, b));
export const NOR = (a, b) => NOT(OR(a, b));
export const XNOR = (a, b) => NOT(XOR(a, b));

/**
 * 8-to-3 Priority Encoder (Active High)
 * Inputs: D0..D7 (array of length 8, boolean/binary)
 * Outputs: { A2, A1, A0, V (Valid bit), codeString }
 */
export function simulateEncoder(inputs) {
  // Pad or trim to 8 lines
  const D = [0, 1, 2, 3, 4, 5, 6, 7].map(i => (inputs[i] ? 1 : 0));

  // Valid flag: 1 if any non-zero input is active
  const V = D.slice(1).some(v => v === 1) ? 1 : 0;

  // Boolean equations for active-high 8-to-3 priority encoder:
  // A2 = D4 + D5 + D6 + D7
  const A2 = OR(OR(D[4], D[5]), OR(D[6], D[7]));

  // A1 = D2 + D3 + D6 + D7
  const A1 = OR(OR(D[2], D[3]), OR(D[6], D[7]));

  // A0 = D1 + D3 + D5 + D7
  const A0 = OR(OR(D[1], D[3]), OR(D[5], D[7]));

  const codeString = `${A2}${A1}${A0}`;
  const decimalValue = A2 * 4 + A1 * 2 + A0;

  return {
    inputs: D,
    A2,
    A1,
    A0,
    V,
    codeString,
    decimalValue
  };
}

/**
 * Control Logic Gate Circuit
 * Computes validity of the vote and anti-tamper parity
 * Formula: VALID_VOTE = SELECTED AND ENABLE AND NOT LOCKED
 */
export function simulateControlGates({ selected, enable, locked, encoderBits = [0, 0, 0] }) {
  const notLocked = NOT(locked ? 1 : 0);
  const selectedAndEnable = AND(selected ? 1 : 0, enable ? 1 : 0);
  const validVote = AND(selectedAndEnable, notLocked);

  // XOR Parity check across the 3 binary bits: A2 ^ A1 ^ A0
  const parityBit = XOR(XOR(encoderBits[0] || 0, encoderBits[1] || 0), encoderBits[2] || 0);

  return {
    notLocked,
    selectedAndEnable,
    validVote,
    parityBit,
    statusText: validVote
      ? 'GATE OPEN: Valid Vote Triggered'
      : locked
      ? 'GATE BLOCKED: EVM Ballot Unit is Locked'
      : !enable
      ? 'GATE INHIBITED: Waiting for Control Unit Permit'
      : 'STANDBY: No Candidate Selected'
  };
}

/**
 * D Flip-Flop Register (3-bit Parallel-In Parallel-Out)
 * On clock rising edge (clockEdge = true), stores D inputs.
 */
export function simulateDFlipFlopRegister({ D = [0, 0, 0], clockEdge = false, currentQ = [0, 0, 0], reset = false }) {
  if (reset) {
    return {
      Q: [0, 0, 0],
      Qbar: [1, 1, 1],
      codeString: '000',
      clockTriggered: false
    };
  }

  const nextQ = clockEdge ? [...D] : [...currentQ];
  const nextQbar = nextQ.map(q => NOT(q));

  return {
    Q: nextQ,
    Qbar: nextQbar,
    codeString: `${nextQ[0]}${nextQ[1]}${nextQ[2]}`,
    clockTriggered: clockEdge
  };
}

/**
 * 3-to-8 Binary Decoder with Enable
 * Converts binary register code [Q2, Q1, Q0] to 8 output lines (Y0..Y7)
 */
export function simulateDecoder(Q = [0, 0, 0], enable = 1) {
  const [Q2, Q1, Q0] = Q;
  const nQ2 = NOT(Q2);
  const nQ1 = NOT(Q1);
  const nQ0 = NOT(Q0);

  const Y = new Array(8).fill(0);
  if (enable) {
    Y[0] = AND(AND(nQ2, nQ1), nQ0);
    Y[1] = AND(AND(nQ2, nQ1), Q0);
    Y[2] = AND(AND(nQ2, Q1), nQ0);
    Y[3] = AND(AND(nQ2, Q1), Q0);
    Y[4] = AND(AND(Q2, nQ1), nQ0);
    Y[5] = AND(AND(Q2, nQ1), Q0);
    Y[6] = AND(AND(Q2, Q1), nQ0);
    Y[7] = AND(AND(Q2, Q1), Q0);
  }

  const activeIndex = Y.indexOf(1);

  return {
    Y,
    enable,
    activeLine: activeIndex >= 0 ? activeIndex : null
  };
}

/**
 * 4-Bit Synchronous Binary Counter
 * Increments on clock pulse when enable = 1
 * Represented as 4 flip-flop state bits [Q3, Q2, Q1, Q0]
 */
export function simulateCounterIncrement(currentCount = 0) {
  const nextCount = (currentCount + 1) % 16; // 4-bit wraps at 16
  const binaryString = nextCount.toString(2).padStart(4, '0');
  const bits = binaryString.split('').map(Number); // [Q3, Q2, Q1, Q0]

  return {
    count: nextCount,
    binaryString,
    Q3: bits[0],
    Q2: bits[1],
    Q1: bits[2],
    Q0: bits[3]
  };
}

export function numberTo4BitCounter(count = 0) {
  const val = count % 16;
  const binaryString = val.toString(2).padStart(4, '0');
  const bits = binaryString.split('').map(Number);
  return {
    count: val,
    rawTotal: count,
    binaryString,
    Q3: bits[0],
    Q2: bits[1],
    Q1: bits[2],
    Q0: bits[3]
  };
}

/**
 * BCD to 7-Segment Display Decoder (Simulating 7447/7448 IC)
 * Converts a decimal digit (0-9) into segment activations a, b, c, d, e, f, g
 *
 * Segment layout:
 *      --- a ---
 *     |         |
 *     f         b
 *     |         |
 *      --- g ---
 *     |         |
 *     e         c
 *     |         |
 *      --- d ---
 */
export function bcdToSevenSegment(digit = 0) {
  const val = Math.max(0, Math.min(9, Math.floor(digit)));
  // BCD bits B3 B2 B1 B0
  const bcd = val.toString(2).padStart(4, '0');
  const B3 = Number(bcd[0]);
  const B2 = Number(bcd[1]);
  const B1 = Number(bcd[2]);
  const B0 = Number(bcd[3]);

  const nB3 = NOT(B3);
  const nB2 = NOT(B2);
  const nB1 = NOT(B1);
  const nB0 = NOT(B0);

  // Standard boolean expressions for 7-segment decoder
  const a = OR(OR(B3, B1), OR(AND(B2, B0), AND(nB2, nB0)));
  const b = OR(nB2, OR(AND(nB1, nB0), AND(B1, B0)));
  const c = OR(OR(B2, nB1), B0);
  const seg_d = OR(OR(B3, AND(nB2, nB0)), OR(OR(AND(nB2, B1), AND(B1, nB0)), AND(AND(B2, nB1), B0)));
  const e = OR(AND(nB2, nB0), AND(B1, nB0));
  const f = OR(OR(B3, AND(nB1, nB0)), OR(AND(B2, nB1), AND(B2, nB0)));
  const g = OR(OR(B3, XOR(B2, B1)), AND(B1, nB0));

  return {
    digit: val,
    bcdString: bcd,
    bits: { B3, B2, B1, B0 },
    segments: {
      a: a ? 1 : 0,
      b: b ? 1 : 0,
      c: c ? 1 : 0,
      d: seg_d ? 1 : 0,
      e: e ? 1 : 0,
      f: f ? 1 : 0,
      g: g ? 1 : 0
    }
  };
}

/**
 * Full Complete EVM DLD Simulation Pipeline
 * Computes all signals throughout the whole voting machine
 */
export function evaluateFullCircuit({
  candidateId = null,
  totalCandidates = 4,
  ballotUnitLocked = false,
  enableSignal = true,
  clockPulse = false,
  counters = {},
  totalVotes = 0
}) {
  // 1. Input Lines (1-hot vector D0..D7)
  const inputLines = new Array(8).fill(0);
  let selected = 0;
  if (candidateId && candidateId >= 1 && candidateId <= 7) {
    inputLines[candidateId] = 1;
    selected = 1;
  }

  // 2. Priority Encoder
  const encoderResult = simulateEncoder(inputLines);
  const encoderBits = [encoderResult.A2, encoderResult.A1, encoderResult.A0];

  // 3. Logic Gates
  const controlGates = simulateControlGates({
    selected,
    enable: enableSignal,
    locked: ballotUnitLocked,
    encoderBits
  });

  // 4. D Flip-Flop Register
  const flipFlop = simulateDFlipFlopRegister({
    D: encoderBits,
    clockEdge: clockPulse && controlGates.validVote,
    currentQ: selected ? encoderBits : [0, 0, 0],
    reset: false
  });

  // 5. Decoder (3-to-8)
  const decoder = simulateDecoder(flipFlop.Q, controlGates.validVote ? 1 : 0);

  // 6. Synchronous Counter simulation
  const candidateCounters = {};
  for (let cid = 1; cid <= totalCandidates; cid++) {
    const count = counters[cid] !== undefined ? counters[cid] : 0;
    candidateCounters[cid] = numberTo4BitCounter(count);
  }

  // 7. Total Vote Counter & 7-Segment Displays (up to 3 digits)
  const totalCountClamped = totalVotes % 1000;
  const digitHundreds = Math.floor(totalCountClamped / 100);
  const digitTens = Math.floor((totalCountClamped % 100) / 10);
  const digitUnits = totalCountClamped % 10;

  const displayHundreds = bcdToSevenSegment(digitHundreds);
  const displayTens = bcdToSevenSegment(digitTens);
  const displayUnits = bcdToSevenSegment(digitUnits);

  return {
    timestamp: Date.now(),
    inputs: {
      candidateId,
      inputLines,
      selected,
      enableSignal,
      ballotUnitLocked,
      clockPulse
    },
    encoder: encoderResult,
    controlGates,
    flipFlop,
    decoder,
    candidateCounters,
    totalVotes,
    sevenSegment: {
      hundreds: displayHundreds,
      tens: displayTens,
      units: displayUnits
    }
  };
}
