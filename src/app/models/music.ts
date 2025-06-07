//Classes
export class Config {
  allowedKeys: number[] = new Array<number>(1).fill(0);
  allowedClefs: Clef[] = new Array<Clef>(new Clef(Step.G, 2)/*, new Clef(Step.F, 4)*/);

  maxLedgerLines: number = 2;
}

export class Measure {
  key: number = 0;
  clef: Clef = new Clef(Step.G, 2);
  notes: Pitch[] = [];

  addNote(note: Pitch) {
    note.alter = getNaturalCancelAlter(this.key, note.step);
    this.notes.push(note);
  };
  
  serialize(measureNumber: number) {
    const includeAttributes: boolean = true;

    const result =  `
      <measure number="${measureNumber}">
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
        ${this.notes.map(note => note.serialize())}
      </measure>
    `;
    return result;
  }
}

export class Pitch {
  step: Step;
  octave: number;
  alter: number;

  constructor(step: Step, octave: number, alter: number = 0) {
    this.step = step;
    this.octave = octave;
    this.alter = alter;
  }

  getValue(): number {
    return ((this.octave + 1) * 7) + (this.step - 1);
  }

  getMIDINumber(): number {
    return 12 + (this.octave * 12) + stepSemitoneMap[this.step];
  }

  serialize(): string {
    return `
      <note>
        <pitch>
          <step>${Step[this.step]}</step>
          <octave>${this.octave}</octave>
          <alter>${this.alter}</alter>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    `;
  }

  static fromValue(value: number): Pitch {
    const step: Step = (value % 7) + 1;
    return new Pitch(step, Math.floor(value / 7) - 1);
  }

  static fromElement(note: Element): Pitch {
    let stepStr: string = "", octave: number = 0, alter: number = 0; 
    const firstPitch = note.getElementsByTagName("pitch")[0];

    //Step
    stepStr = firstPitch.getElementsByTagName("step")[0].innerHTML;

    //Octave
    octave = parseInt(firstPitch.getElementsByTagName("octave")[0].innerHTML);

    //Alter
    if (firstPitch.getElementsByTagName("alter").length > 0)
      alter = parseInt(firstPitch.getElementsByTagName("alter")[0].innerHTML);
        
    return new Pitch(Step[stepStr as keyof typeof Step], octave, alter);
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

    const basePitch: Pitch = clefPitchMap[clef.toString()];

    if (minOrMax == false) {
      const stepDifference: number = 2 * (clef.line - 1) + 2 * (maxLedgerLines);
      return Pitch.fromValue(basePitch.getValue() - stepDifference);
    } else {
      const stepDifference: number = 2 * (5 - clef.line) + 2 * (maxLedgerLines);
      return Pitch.fromValue(basePitch.getValue() + stepDifference);
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

