import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  Signal,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { CapacitorContacts, ContactProperty } from '@capgo/capacitor-contacts';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { IContact, IEvent } from '../../../models/IEvent';
import { dateKey, weekDays } from '../../../models/event-date';
import { EventService } from '../../../services/event.service';
import { PhotoService } from '../../../services/photo.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaComponent implements OnInit, OnDestroy {
  readonly view: WritableSignal<'home' | 'week' | 'form' | 'success' | 'backup'>;

  readonly today: WritableSignal<Date>;

  readonly offset: WritableSignal<number>;

  readonly loading: WritableSignal<boolean>;

  readonly busy: WritableSignal<boolean>;

  readonly error: WritableSignal<string>;

  readonly message: WritableSignal<string>;

  readonly editingId: WritableSignal<string | null>;

  readonly updated: WritableSignal<boolean>;

  readonly selectedContactId: WritableSignal<string | null>;

  readonly photos: WritableSignal<string[]>;

  readonly selectedPhoto: WritableSignal<string>;

  readonly confetti = Array.from({ length: 42 }, (_, index) => index);

  readonly form = new FormGroup({
    theme: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    contactName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    phone: new FormControl('', { nonNullable: true }),
    date: new FormControl(dateKey(new Date()), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    time: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    deposit: new FormControl<number | null>(null, [Validators.min(0)]),
    amount: new FormControl<number | null>(null, [Validators.min(0)]),
    location: new FormControl('', { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
    saveContact: new FormControl(false, { nonNullable: true }),
  });

  readonly events: Signal<IEvent[]>;

  readonly days: Signal<Date[]>;

  readonly thisWeek: Signal<IEvent[]>;

  readonly upcoming: Signal<IEvent[]>;

  private refreshTimer?: ReturnType<typeof setInterval>;

  private readonly eventService = inject(EventService);

  private readonly photoService = inject(PhotoService);

  constructor() {
    this.view = signal('home');
    this.today = signal(new Date());
    this.offset = signal(0);
    this.loading = signal(true);
    this.busy = signal(false);
    this.error = signal('');
    this.message = signal('');
    this.editingId = signal(null);
    this.updated = signal(false);
    this.selectedContactId = signal(null);
    this.photos = signal([]);
    this.selectedPhoto = signal('');
    this.events = this.eventService.events;
    this.days = computed(() => weekDays(this.today(), this.offset()));
    this.thisWeek = computed(() => {
      const days = weekDays(this.today());
      return this.eventService
        .events()
        .filter((event) => event.date >= dateKey(days[0]) && event.date <= dateKey(days[6]));
    });
    this.upcoming = computed(() =>
      this.eventService
        .events()
        .filter((event) => event.date >= dateKey(this.today()))
        .slice(0, 5),
    );
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.eventService.load();
    } catch {
      this.error.set('No pudimos leer tus eventos. Volvé a abrir la app o restaurá una copia.');
    } finally {
      this.loading.set(false);
    }
    this.refreshTimer = setInterval(() => this.today.set(new Date()), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshTimer);
  }

  protected navigate(view: 'home' | 'week' | 'backup'): void {
    this.error.set('');
    this.message.set('');
    this.view.set(view);
    window.scrollTo({ top: 0 });
    this.today.set(new Date());
    if (view === 'week') this.offset.set(0);
  }

  protected openForm(event?: IEvent): void {
    this.error.set('');
    this.message.set('');
    this.editingId.set(event?.id ?? null);
    this.updated.set(!!event);
    this.selectedContactId.set(event?.contactId ?? null);
    this.photos.set([...(event?.photos ?? [])]);
    this.form.reset({
      theme: event?.theme ?? '',
      contactName: event?.contactName ?? '',
      phone: event?.phone ?? '',
      date: event?.date ?? dateKey(new Date()),
      time: event?.time ?? '',
      deposit: event?.deposit ?? null,
      amount: event?.amount ?? null,
      location: event?.location ?? '',
      notes: event?.notes ?? '',
      saveContact: false,
    });
    this.view.set('form');
    window.scrollTo({ top: 0 });
  }

  protected eventsFor(day: Date): IEvent[] {
    return this.eventService.events().filter((event) => event.date === dateKey(day));
  }

  protected isToday(day: Date): boolean {
    return dateKey(day) === dateKey(this.today());
  }

  protected formatDate(value: string): string {
    return new Date(`${value}T12:00:00`).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
    });
  }

  protected async loadContacts(): Promise<void> {
    this.error.set('');
    if (!Capacitor.isNativePlatform()) {
      this.error.set(
        'La agenda del teléfono está disponible en la app Android o iOS. En esta vista podés cargar el contacto manualmente.',
      );
      return;
    }
    this.busy.set(true);
    try {
      const result = await CapacitorContacts.pickContacts({
        property: ContactProperty.PhoneNumber,
      });
      const contact = result.contacts[0];
      if (contact)
        this.chooseContact({
          id: contact.id ?? '',
          name:
            contact.displayName ||
            [contact.givenName, contact.familyName].filter(Boolean).join(' ') ||
            'Sin nombre',
          phone: contact.phoneNumbers?.[0]?.value ?? '',
        });
    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No pudimos acceder a la agenda. Podés cargar el contacto manualmente.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected chooseContact(contact: IContact): void {
    this.form.patchValue({ contactName: contact.name, phone: contact.phone, saveContact: false });
    this.selectedContactId.set(contact.id);
  }

  protected detachContact(): void {
    this.selectedContactId.set(null);
  }

  protected async addPhotos(input: HTMLInputElement): Promise<void> {
    if (this.busy() || this.photos().length >= 6) return;
    if (!Capacitor.isNativePlatform()) {
      input.click();
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      const photos = await this.photoService.pick(6 - this.photos().length);
      this.photos.update((current) => [...current, ...photos]);
    } catch (error) {
      if (!/cancel/i.test(error instanceof Error ? error.message : String(error))) {
        this.error.set(
          'No pudimos abrir la galería. Revisá el permiso de fotos en los ajustes del teléfono e intentá de nuevo.',
        );
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected async importPhotos(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const photos = await this.photoService.fromFiles(input.files, 6 - this.photos().length);
      this.photos.update((current) => [...current, ...photos]);
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No pudimos agregar las fotos.');
    } finally {
      input.value = '';
      this.busy.set(false);
    }
  }

  protected removePhoto(index: number): void {
    this.photos.update((photos) => photos.filter((_, position) => position !== index));
  }

  protected showPhoto(photo: string, viewer: HTMLDialogElement): void {
    this.selectedPhoto.set(photo);
    viewer.showModal();
  }

  protected async save(): Promise<void> {
    if (this.busy() || this.loading()) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error.set(
        'Completá temática, nombre del contacto, fecha y hora. Los importes deben ser positivos o quedar vacíos.',
      );
      return;
    }
    this.busy.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    const event: IEvent = {
      id: this.editingId() ?? crypto.randomUUID(),
      theme: value.theme.trim(),
      contactName: value.contactName.trim(),
      phone: value.phone.trim(),
      contactId: this.selectedContactId(),
      date: value.date,
      time: value.time,
      deposit: value.deposit,
      amount: value.amount,
      location: value.location.trim(),
      notes: value.notes.trim(),
      photos: [...this.photos()],
    };
    try {
      await this.eventService.save(event);
      this.editingId.set(event.id);
      if (value.saveContact && !event.contactId) await this.createPhoneContact(event);
      this.view.set('success');
      window.scrollTo({ top: 0 });
    } catch (error) {
      this.error.set(
        error instanceof Error ? error.message : 'No se pudo guardar. Intentá de nuevo.',
      );
    } finally {
      this.busy.set(false);
    }
  }

  protected async exportBackup(): Promise<void> {
    this.error.set('');
    try {
      const fileName = `eventos-${dateKey(new Date())}.json`;
      const data = this.eventService.backup();
      if (Capacitor.isNativePlatform()) {
        const file = await Filesystem.writeFile({
          path: fileName,
          data,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        await Share.share({ title: 'Copia de mis eventos', url: file.uri });
      } else {
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      this.error.set('No se pudo compartir la copia o se canceló la operación.');
    }
  }

  protected async importBackup(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.error.set('');
    this.message.set('');
    this.busy.set(true);
    try {
      if (file.size > 100_000_000) throw new Error('La copia supera el máximo de 100 MB.');
      await this.eventService.restore(await file.text());
      this.message.set('Copia restaurada. Los eventos se combinaron con tu agenda.');
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'No se pudo restaurar la copia.');
    } finally {
      input.value = '';
      this.busy.set(false);
    }
  }

  private async createPhoneContact(event: IEvent): Promise<void> {
    try {
      if (!Capacitor.isNativePlatform()) throw new Error();
      const permission = await CapacitorContacts.requestPermissions({
        permissions: ['writeContacts'],
      });
      if (!['granted', 'limited'].includes(permission.writeContacts)) throw new Error();
      const result = await CapacitorContacts.createContact({
        contact: {
          givenName: event.contactName,
          phoneNumbers: event.phone ? [{ value: event.phone, type: 'MOBILE' }] : [],
        },
      });
      this.form.patchValue({ saveContact: false });
      this.selectedContactId.set(result.id);
      await this.eventService.save({ ...event, contactId: result.id });
    } catch {
      this.message.set(
        'El evento quedó guardado. No pudimos agregar el contacto a la agenda del teléfono; podés hacerlo después.',
      );
    }
  }
}
