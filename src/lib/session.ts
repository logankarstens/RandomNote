import * as Music from '@/app/models/music';
import { cookies } from 'next/headers';

export class Session { 
  config: Music.Config = new Music.Config();
  
  public static fromJSON(json: any): Session {
    const result: Session = new Session();
    result.config = Music.Config.fromJSON(json.config);
    return result;
  }
}

export const getSession = async (): Promise<Session> => {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('notemax');
    if (cookie == undefined)
      return new Session(); //TODO: handle error

    if (cookie.value) {
      const rawSession = JSON.parse(cookie.value);
      return Session.fromJSON(rawSession);
    }
    return new Session();
  } catch (ex) {
    console.error(ex);
    return new Session();
  }
}

export const saveSession = async (session: Session): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const sessionStr = JSON.stringify(session);
    cookieStore.set('notemax', sessionStr);
    return true;
  } catch (ex) {
    console.error(ex);
    return false;
  }
}

