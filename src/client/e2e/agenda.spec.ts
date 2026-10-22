import { expect, test } from '@playwright/test';

// Each test uses an isolated browser context. All records below are local test
// fixtures; no phone contacts, account, server or existing user data are used.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-22T15:00:00Z'));
  await page.goto('/');
  await expect(page.locator('body')).not.toContainText('Abriendo tu agenda');
});

test('saves without amounts, persists after reload and allows completing them later', async ({
  page,
}) => {
  await expect(page.getByRole('img', { name: 'help by Ine' })).toBeVisible();
  await page.screenshot({ path: 'test-results/help-inicio.png', fullPage: true });
  await page.getByRole('button', { name: '＋ Agendar un evento' }).click();
  await page.getByLabel('Temática *').fill('Safari de Mateo');
  await page.getByLabel('Nombre *', { exact: true }).fill('Lucía Pérez');
  await page.getByLabel('Fecha *').fill('2026-10-24');
  await page.getByLabel('Hora *').fill('17:30');
  await page.getByRole('button', { name: 'Agendar y celebrar' }).click();
  await expect(page.getByRole('heading', { name: /Felicitaciones/ })).toBeVisible();
  await page.screenshot({ path: 'test-results/celebracion.png', fullPage: true });
  await page.getByRole('button', { name: 'Volver al inicio' }).click();
  await expect(page.getByRole('button', { name: /Tenés 1 evento esta semana/ })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Safari de Mateo/ }).click();
  await expect(page.getByLabel('Monto total')).toBeEmpty();
  await expect(page.getByLabel('Seña')).toBeEmpty();
  await page.getByLabel('Monto total').fill('150000');
  await page.getByLabel('Seña').fill('0');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('heading', { name: /actualizado/ })).toBeVisible();
  await page.getByRole('button', { name: 'Volver al inicio' }).click();
  await page.getByRole('button', { name: /Tenés 1 evento esta semana/ }).click();
  const saturday = page.locator('.day').filter({ hasText: 'sábado' });
  await expect(
    saturday.getByRole('button', { name: /17:30 Safari de Mateo Lucía Pérez/ }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/semana.png', fullPage: true });
  await page.getByRole('button', { name: 'Semana siguiente' }).click();
  await expect(page.getByRole('button', { name: /Safari de Mateo/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver a esta semana' }).click();
  await expect(page.getByRole('button', { name: /Safari de Mateo/ })).toBeVisible();
  await page.getByRole('button', { name: /Safari de Mateo/ }).click();
  await expect(page.getByLabel('Monto total')).toHaveValue('150000');
  await expect(page.getByLabel('Seña')).toHaveValue('0');
});

test('keeps Monday through Sunday in the same week across the year boundary', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2027-01-03T15:00:00Z'));
  await page.reload();
  await page.getByRole('button', { name: 'Mis copias' }).click();
  const base = {
    contactName: 'Contacto de prueba',
    phone: '',
    contactId: null,
    time: '12:00',
    deposit: null,
    amount: null,
    notes: '',
    location: '',
  };
  const events = [
    { ...base, id: 'monday', theme: 'Lunes de diciembre', date: '2026-12-28' },
    { ...base, id: 'sunday', theme: 'Domingo de enero', date: '2027-01-03' },
    { ...base, id: 'next', theme: 'Semana siguiente', date: '2027-01-04' },
  ];
  await page.getByLabel('Seleccionar copia').setInputFiles({
    name: 'copia.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 1, events })),
  });
  await expect(page.getByRole('status')).toContainText('Copia restaurada');
  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await page.getByRole('button', { name: /Tenés 2 eventos esta semana/ }).click();
  await expect(page.getByRole('button', { name: /Lunes de diciembre/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Domingo de enero/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Semana siguiente Contacto/ })).toHaveCount(0);
});

test('does not show success when local storage fails', async ({ page }) => {
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = () => {
      throw new Error('Storage unavailable');
    };
  });
  await page.getByRole('button', { name: '＋ Agendar un evento' }).click();
  await page.getByLabel('Temática *').fill('Evento que no se pudo guardar');
  await page.getByLabel('Nombre *', { exact: true }).fill('Contacto de prueba');
  await page.getByLabel('Hora *').fill('16:00');
  await page.getByRole('button', { name: 'Agendar y celebrar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Felicitaciones/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Volver al inicio' }).click();
  await expect(page.getByRole('button', { name: /Evento que no se pudo guardar/ })).toHaveCount(0);
});

test('adds gallery photos to an existing event, backs them up and removes them', async ({
  page,
}) => {
  const legacy = {
    version: 1,
    events: [
      {
        id: 'legacy-event',
        theme: 'Fiesta con fotos',
        contactName: 'Ana',
        phone: '',
        contactId: null,
        date: '2026-10-24',
        time: '17:00',
        deposit: null,
        amount: null,
        location: '',
        notes: '',
      },
    ],
  };
  await page.evaluate(
    (data) => localStorage.setItem('CapacitorStorage.manage-eventos.v1', JSON.stringify(data)),
    legacy,
  );
  await page.reload();
  await page.getByRole('button', { name: /Fiesta con fotos/ }).click();
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ffca25';
    context.fillRect(0, 0, 100, 100);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.getByLabel('Seleccionar fotos del evento').setInputFiles({
    name: 'referencia.png',
    mimeType: 'image/png',
    buffer: Buffer.from(image, 'base64'),
  });
  await expect(page.getByRole('img', { name: 'Foto del evento 1', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('heading', { name: /actualizado/ })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: /Fiesta con fotos/ }).click();
  await page.getByRole('button', { name: 'Ver foto 1', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Foto del evento' })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar foto' }).click();
  await page.getByRole('button', { name: 'Copias de seguridad', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar eventos' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const backup = Buffer.concat(chunks);
  const data = JSON.parse(backup.toString());
  expect(data.events[0].photos[0]).toMatch(/^data:image\/jpeg;base64,/);
  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await page.getByRole('button', { name: /Fiesta con fotos/ }).click();
  await page.getByRole('button', { name: 'Quitar foto 1' }).click();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByRole('heading', { name: /actualizado/ })).toBeVisible();
  await page.getByRole('button', { name: 'Copias de seguridad', exact: true }).click();
  await page
    .getByLabel('Seleccionar copia')
    .setInputFiles({ name: 'fotos.json', mimeType: 'application/json', buffer: backup });
  await expect(page.getByRole('status')).toContainText('Copia restaurada');
  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await page.getByRole('button', { name: /Fiesta con fotos/ }).click();
  await expect(page.getByRole('img', { name: 'Foto del evento 1', exact: true })).toBeVisible();
});

test('validates required details and supports manual contacts in the browser', async ({ page }) => {
  await page.getByRole('button', { name: '＋ Agendar un evento' }).click();
  await page.getByRole('button', { name: 'Agendar y celebrar' }).click();
  await expect(page.getByRole('alert')).toContainText('Completá temática');
  await page.getByRole('button', { name: 'Buscar en agenda' }).click();
  await expect(page.getByRole('alert')).toContainText('Android o iOS');
  await expect(page.getByLabel('Nombre *', { exact: true })).toBeEditable();
});

test('restores a validated backup and rejects invalid data without losing events', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Mis copias' }).click();
  const fixture = {
    version: 1,
    events: [
      {
        id: 'backup-fixture',
        theme: 'Arcoíris',
        contactName: 'Ana',
        phone: '123',
        contactId: null,
        date: '2026-10-25',
        time: '15:00',
        deposit: null,
        amount: null,
        notes: '',
        location: '',
      },
    ],
  };
  const file = page.getByLabel('Seleccionar copia');
  await file.setInputFiles({
    name: 'copia.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await expect(page.getByRole('status')).toContainText('Copia restaurada');
  await file.setInputFiles({
    name: 'invalida.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":1,"events":[{}]}'),
  });
  await expect(page.getByRole('alert')).toContainText('formato válido');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar eventos' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^eventos-.*\.json$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  expect(JSON.parse(Buffer.concat(chunks).toString()).events).toEqual(fixture.events);
  await page.getByRole('button', { name: 'Inicio', exact: true }).click();
  await expect(page.getByRole('button', { name: /Arcoíris/ })).toBeVisible();
});
