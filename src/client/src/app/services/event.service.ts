import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { IEvent } from '../models/IEvent';

const STORAGE_KEY = 'manage-eventos.v1';

const EVENTS_FILE = 'help-eventos-v2.json';

export function isEvent(value: unknown): value is IEvent {
  if (typeof value !== 'object' || value === null) return false;
  const event = value as Record<string, unknown>;
  const strings = ['id', 'theme', 'contactName', 'phone', 'date', 'time', 'location', 'notes'];
  if (!strings.every((key) => typeof event[key] === 'string')) return false;
  if (
    !String(event['id']).trim() ||
    !String(event['theme']).trim() ||
    !String(event['contactName']).trim()
  )
    return false;
  const date = String(event['date']);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    return false;
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(event['time']))) return false;
  if (event['contactId'] !== null && typeof event['contactId'] !== 'string') return false;
  const photos = event['photos'];
  if (
    photos !== undefined &&
    (!Array.isArray(photos) ||
      photos.length > 6 ||
      !photos.every(
        (photo) =>
          typeof photo === 'string' &&
          photo.length <= 600_000 &&
          /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo),
      ))
  )
    return false;
  return ['deposit', 'amount'].every(
    (key) =>
      event[key] === null ||
      (typeof event[key] === 'number' && Number.isFinite(event[key]) && Number(event[key]) >= 0),
  );
}

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly events: Signal<IEvent[]>;

  private readonly _events: WritableSignal<IEvent[]>;

  private loaded = false;

  constructor() {
    this._events = signal([]);
    this.events = this._events.asReadonly();
  }

  async load(): Promise<void> {
    const { files } = await Filesystem.readdir({ path: '', directory: Directory.Data });
    if (files.some((file) => file.name === EVENTS_FILE)) {
      const { data } = await Filesystem.readFile({
        path: EVENTS_FILE,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      if (typeof data !== 'string') throw new Error('No pudimos leer la agenda.');
      this._events.set(this.parseBackup(data));
    } else {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value !== null) this._events.set(this.parseBackup(value));
    }
    this.loaded = true;
  }

  async save(event: IEvent): Promise<void> {
    if (!this.loaded)
      throw new Error('No pudimos abrir tu agenda. Restaurá una copia antes de guardar eventos.');
    if (!isEvent(event)) throw new Error('Revisá los datos del evento.');
    const next = [...this._events().filter((item) => item.id !== event.id), event];
    await this.persist(next);
  }

  backup(): string {
    if (!this.loaded) throw new Error('No pudimos leer la agenda para exportarla.');
    return JSON.stringify({ version: 1, events: this._events() }, null, 2);
  }

  async restore(value: string): Promise<void> {
    const imported = this.parseBackup(value);
    const merged = new Map(this._events().map((event) => [event.id, event]));
    for (const event of imported) merged.set(event.id, event);
    await this.persist([...merged.values()]);
  }

  private parseBackup(value: string): IEvent[] {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('version' in parsed) ||
      parsed.version !== 1 ||
      !('events' in parsed) ||
      !Array.isArray(parsed.events) ||
      !parsed.events.every(isEvent)
    ) {
      throw new Error(
        'La copia no tiene un formato válido. Tus eventos actuales no se modificaron.',
      );
    }
    if (new Set(parsed.events.map((event) => event.id)).size !== parsed.events.length)
      throw new Error('La copia contiene eventos duplicados.');
    return parsed.events;
  }

  private async persist(events: IEvent[]): Promise<void> {
    events.sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    await Filesystem.writeFile({
      path: `${EVENTS_FILE}.tmp`,
      data: JSON.stringify({ version: 1, events }),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    await Filesystem.rename({
      from: `${EVENTS_FILE}.tmp`,
      to: EVENTS_FILE,
      directory: Directory.Data,
    });
    this._events.set(events);
    this.loaded = true;
  }
}
