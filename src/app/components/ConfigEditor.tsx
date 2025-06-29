import { useEffect, useState } from 'react';
import { loadSerializedConfig, saveSerializedConfig } from '../actions/loadSaveConfig';

type ConfigEditorProps = {
  onChange: (result: boolean) => void;
};

export default function ConfigEditor({ onChange }: ConfigEditorProps) {
  //States
  const [config, setConfig] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>();

  //Initialization
  const init = async () => {
    const loadedConfig: string | null = await loadSerializedConfig();
    if (loadedConfig == null)
      setError("Failed to load configuration. Please refresh and try again.");
    else
      setConfig(loadedConfig);
  }

  //Methods
  const saveConfig = async () => {
    setSaveStatus("Saving...");

    const result: boolean = await saveSerializedConfig(config);
    onChange(result);

    if (result) {
      setSaveStatus("Save successful!");
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } else {
      setError("Error saving config. Please refresh and try again.")
    }
  }

  //Effects
  useEffect(() => { init() }, []);

  if (error != null) {
    return <span className="text-red-400">{error}</span>;
  } if (config.length < 1) {
    return <span className="text-gray-400">Loading...</span>
  } else {
    return <div className="flex flex-col gap-[16px]">
      <hr className="text-gray-700 mt-5" />
      <h6>Edit Configuration</h6>
      <textarea 
        className="whitespace-pre-wrap break-all border border-gray-700 rounded-md p-2 w-full h-32 font-[family-name:var(--font-geist-mono)] text-sm"
        value={config}
        onChange={(v) => setConfig(v.currentTarget.value)}
      ></textarea>
      <div>
        <button
          type="button"
          className="bg-purple-600 px-4 pt-1 pb-0.5 rounded-md cursor-pointer disabled:bg-purple-800 disabled:cursor-auto disabled:text-purple-300"
          onClick={saveConfig}
          disabled={saveStatus != null}
        >
          {saveStatus ? saveStatus : "Save"}
        </button>
      </div>
    </div>
  }
}