'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { IOSMDOptions, OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { createRandomFile } from '../actions/createRandomFile';
import { Pitch, Step } from '../models/music';
import ConfigEditor from './ConfigEditor';

const defaultOptions: IOSMDOptions = {
  autoResize: true,
  drawTitle: false,
  drawTimeSignatures: false,
  drawPartNames: false,
  drawMeasureNumbers: false,
  newPageFromXML: true,
  stretchLastSystemLine: true
}

const measuresPerFile = 1;
const fileQueueMaxBufferSize = 1;

const alterUnicodes: Array<string> = ["\u266D ", "", "\u266F"]

export default function OSMD() {
  //States
  const [osmd, setOsmd] = useState<OpenSheetMusicDisplay | null>(null);
  const container = useRef<HTMLDivElement | null>(null)
  const [measure, setMeasure] = useState<number>(1);

  const [fileQueue, setFileQueue] = useState<Array<string>>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentNotes, setCurrentNotes] = useState<Array<string> | null>(null);

  const [loading, setLoading] = useState<boolean>(true);

  //Initialization
  const init = () => {
    if (container.current != null && osmd == null) {
      setOsmd(new OpenSheetMusicDisplay(container.current, getOptions(measure)));
    }
  }

  //Handlers
  const fileQueueHandler = () => {
    if (fileQueue.length < fileQueueMaxBufferSize)
      loadNextFile();
    if (fileQueue.length > 0 && loading)
      processNextFile();
  }

  const measureHandler = () => {
    if (measure > 1 && osmd != null) {
      osmd.setOptions(getOptions(measure));
      osmd.render();
    }
  }

  const configChangeHandler = (result: boolean) => {
    if (result) {
      setFileQueue([]);
      setLoading(true);
    }
  }

  //Methods
  const getOptions = (measure: number) => {
    const result: IOSMDOptions = defaultOptions;
    result.drawFromMeasureNumber = measure;
    result.drawUpToMeasureNumber = measure;
    return result;
  }

  const loadNextFile = async(): Promise<boolean> => {
    const newFile = await createRandomFile(measuresPerFile);
    if (newFile == null)
      return false;
    setFileQueue((q: Array<string>) => [...q, newFile]);
    return true;
  }

  const processNextFile = useCallback(() => {
    if (fileQueue.length == 0) {
      setLoading(true);
      return;
    }

    const file = fileQueue[0];
    setMeasure(1);
    osmd?.load(file)?.then(() => {
        setCurrentFile(file);
        setCurrentNotes(null);

        osmd.render();
        setLoading(false);
      });

    //Consume the current file
    setFileQueue((q: Array<string>) => q.slice(1));
  }, [fileQueue, osmd])

  const renderNextMeasure = () => {
    if (measure >= measuresPerFile) {
      processNextFile();
    } else if (osmd != null) {
      //TODO: rework newmeasure logic
      const newMeasure: number = measure + 1;
      setMeasure((m: number) => m+1);
      osmd.setOptions(getOptions(newMeasure));
      osmd.render();
    }
  }

  const revealCurrentNotes = () => {
    if (currentFile == null) 
      return;
    
    //Use native DOMParser to read the notes from the current file
    const parser: DOMParser = new DOMParser(),
      xmlDoc: Document = parser.parseFromString(currentFile, "text/xml"),
      notes: HTMLCollectionOf<Element> = xmlDoc.getElementsByTagName("note");

    setCurrentNotes(
      Array.from(notes).map(note => {
        const pitch: Pitch = Pitch.fromElement(note);
        return Step[pitch.step] + alterUnicodes[pitch.alter + 1]; 
      })
    );
  }

  //Effects
  useEffect(init, [measure, osmd]);
  useEffect(fileQueueHandler, [fileQueue.length, loading, measure, processNextFile]);
  useEffect(measureHandler, [measure, processNextFile, osmd]);

  return <>
    <div ref={container} style={{width: '300px', height: '200px', backgroundColor: "white", opacity: (loading && !osmd?.Sheet) ? "0" : "1"}} ></div>

    {!(loading && !osmd?.Sheet) && (
      <div>
        {/*Reveal container*/}
        <div style={{height: "50px"}}>
          <div 
            className="transition-opacity absolute" 
            style={{opacity: currentNotes == null ? "0" : "1"}}>
              {currentNotes == null ? "" : currentNotes.join(", ")}
          </div>
          <button 
            className="transition-opacity absolute bg-green-600 px-4 pt-1 pb-0.5 rounded-md cursor-pointer"
            style={{ opacity: currentNotes == null ? "1" : "0"}}
            onClick={revealCurrentNotes}>
              Reveal
          </button>
        </div>
        <button type="button" className="bg-blue-600 px-4 pt-1 pb-0.5 rounded-md cursor-pointer" onClick={renderNextMeasure}>Next</button>
      </div>
    )}
    <ConfigEditor onChange={configChangeHandler} />
  </>
}