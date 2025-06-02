'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { IOSMDOptions, OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { createRandomFile } from '../actions/createRandomFile';

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

export default function OSMD() {
  const [osmd, setOsmd] = useState<OpenSheetMusicDisplay | null>(null);
  const container = useRef<HTMLDivElement | null>(null)
  const [measure, setMeasure] = useState<number>(1);
  const [fileQueue, setFileQueue] = useState<Array<string>>([]);

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

  //Effects
  useEffect(init, [measure, osmd]);
  useEffect(fileQueueHandler, [fileQueue.length, loading, measure, processNextFile]);
  useEffect(measureHandler, [measure, processNextFile, osmd]);

  return <>
    <div ref={container} style={{width: '300px', height: '200px', backgroundColor: "white", opacity: loading ? "0" : "1"}} ></div>

    {!loading && (
      <button type="button" className="bg-blue-600 px-4 pt-1 pb-0.5 rounded-md cursor-pointer" onClick={renderNextMeasure}>Next</button>
    )}
  </>
}