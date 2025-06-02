//Classes
export class Config {
  allowedKeys: number[] = new Array<number>(1).fill(0);
  allowedClefs: Clef[] = new Array<Clef>(new Clef(Step.G, 2)/*, new Clef(Step.F, 4)*/);

  maxLedgerLines: number = 2;
}

export class Pitch {
  step: Step;
  octave: number;

  constructor(step: Step, octave: number) {
    this.step = step;
    this.octave = octave;
  }

  getValue(): number {
    return ((this.octave + 1) * 7) + (this.step - 1);
  }

  getMIDINumber(): number {
    return 12 + (this.octave * 12) + stepSemitoneMap[this.step];
  }

  static createFromValue(value: number): Pitch {
    let step: Step = (value % 7) + 1;
    return new Pitch(step, Math.floor(value / 7) - 1);
  }
}

export class Clef {
  sign: Step;
  line: number;

  constructor(sign: Step, line: number) {
    this.sign = sign;
    this.line = line;
  }

  toString(): string {
    return Step[this.sign] + this.line.toString();
  }
}

export class Measure {
  key: number = 0;
  clef: Clef = new Clef(Step.G, 2);
  notes: Pitch[] = new Array();

  addNote(note: Pitch) { this.notes.push(note) };
  serialize(index: number) {
    let serializedNotes: string[] = new Array();
    let includeAttributes: boolean = (true);
    this.notes.forEach(note => {
      let alter = getNaturalCancelAlter(this.key, note.step);
      serializedNotes.push(`
        <note>
          <pitch>
            <step>${Step[note.step]}</step>
            <octave>${note.octave}</octave>
            ${alter ? `<alter>${alter}</alter>` : ''}
          </pitch>
          <duration>4</duration>
          <type>quarter</type>
        </note>
      `);
    });

    const result =  `
      <measure number="${index}">
        <print new-page="yes"/>
        ${includeAttributes ? `<attributes>
          <divisions>1</divisions>
          ${this.key != null ? `<key>
            <fifths>${this.key}</fifths>
          </key>` : ''}
          ${this.clef != null ? `<clef>
            <sign>${Step[this.clef?.sign]}</sign>
            <line>${this.clef.line}</line>
          </clef>` : ''}
        </attributes>` : ''}
        ${serializedNotes.join('')}
      </measure>
    `;
    return result;
  }
}

export enum Step {
  C = 1, D = 2, E = 3, F = 4, G = 5, A = 6, B = 7
}

//Helper functions (public)
export function getClefMinPitch(clef: Clef, maxLedgerLines: number): Pitch | null {
  return getClefPitchThreshold(clef, maxLedgerLines, false);
};

export function getClefMaxPitch(clef: Clef, maxLedgerLines: number): Pitch | null {
  return getClefPitchThreshold(clef, maxLedgerLines, true);
};

//Helper functions (private)
function getClefPitchThreshold (clef: Clef, maxLedgerLines: number, minOrMax: boolean): Pitch | null {
   if (clefPitchMap[clef.toString()] == null)
      return null;

    let basePitch: Pitch = clefPitchMap[clef.toString()];

    if (minOrMax == false) {
      let stepDifference: number = 2 * (clef.line - 1) + 2 * (maxLedgerLines);
      return Pitch.createFromValue(basePitch.getValue() - stepDifference);
    } else {
      let stepDifference: number = 2 * (5 - clef.line) + 2 * (maxLedgerLines);
      return Pitch.createFromValue(basePitch.getValue() + stepDifference);
    }
}

function getNaturalCancelAlter(fifths: number, step: Step): -1 | 0 | 1 {
  if (fifths > 0) {
    const sharpedNotes = sharpsOrder.slice(0, fifths);
    return sharpedNotes.includes(step) ? 1 : 0;
  } else if (fifths < 0) {
    const flattedNotes = flatsOrder.slice(0, -fifths);
    return flattedNotes.includes(step) ? -1 : 0;
  } else {
    return 0;
  }
}

//Static references

//Maps
const clefPitchMap: Record<string, Pitch> = {
  'G2': new Pitch(Step.G, 4),
  'F4': new Pitch(Step.F, 3),
  'C3': new Pitch(Step.C, 4),
  'C4': new Pitch(Step.C, 4),
  'F3': new Pitch(Step.F, 3)
};

const stepSemitoneMap: Record<Step, number> = {
  3: 0, 4: 2, 5: 4, 6: 5, 7: 7, 1: 9, 2: 11
};

//Key signature sharp/flat orders
const sharpsOrder: Step[] = [Step.F, Step.C, Step.G, Step.D, Step.A, Step.E, Step.B];
const flatsOrder: Step[] = [Step.B, Step.E, Step.A, Step.D, Step.G, Step.C, Step.F];

