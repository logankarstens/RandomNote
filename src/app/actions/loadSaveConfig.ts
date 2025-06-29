'use server'

import { getSession, saveSession, Session } from "@/lib/session";
import * as Music from '../models/music';

export async function loadConfig(): Promise<Music.Config | null> {
  const session: Session = await getSession();
  if (session.config) {
    return session.config;
  } else {
      const newConfig: Music.Config = new Music.Config();
      if (await saveConfig(newConfig))
        return newConfig;
  }
  return null;
}

export async function saveConfig(config: Music.Config): Promise<boolean> {
  try {
    const session: Session = await getSession();
    session.config = config;
    return await saveSession(session);
  } catch (ex) {
    console.error("Error saving config.", ex);
    return false; 
  }
}

export async function loadSerializedConfig(): Promise<string | null> {
    const result: Music.Config | null = await loadConfig();
    return (result == null) ? null : JSON.stringify(result);
}

export async function saveSerializedConfig(configStr: string): Promise<boolean> {
  try {
    const config: Music.Config = JSON.parse(configStr);
    return saveConfig(config);
  } catch (ex) {
    console.error("Error parsing config.", ex);
    return false;
  }
}