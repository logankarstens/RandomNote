'use server'

import * as Music from "../models/music";

import { promises as fs } from 'fs';
import path from 'path';

export async function createRandomFile(numNotes: number): Promise<string | null>  {
  //Load template
  let result = await fs.readFile(path.join(process.cwd(), 'assets', 'template.xml'), 'utf8');

  //Load config
  const config: Music.Config = new Music.Config();

  //Create & serialize measures
  const serializedMeasures: string[] = [];
  for (let i: number = 0; i < numNotes; i++) {
    const measure = new Music.Measure();

    //Randomize key & clef
    measure.key = config.allowedKeys[getRandomInt(0, config.allowedKeys.length - 1)];
    measure.clef = config.allowedClefs[getRandomInt(0, config.allowedClefs.length - 1)];
        
    //Randomize notes
    for (let j = 0; j < 1; j++) { //TODO: config # notes/measure
      const minPitch: Music.Pitch | null = Music.getClefMinPitch(measure.clef, config.maxLedgerLines),
        maxPitch: Music.Pitch | null = Music.getClefMaxPitch(measure.clef, config.maxLedgerLines);

      if (minPitch == null || maxPitch == null)
        return null;

      const pitchValue = getRandomInt(minPitch.getValue(), maxPitch.getValue());
      const note: Music.Pitch = Music.Pitch.createFromValue(pitchValue);

      measure.addNote(note);
    }
    
    //Append measure
    serializedMeasures.push(measure.serialize(i + 1));
  }

  //Add notes to XML
  result = result.replace("{measures}", serializedMeasures.join(''));
  return result;
}

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}