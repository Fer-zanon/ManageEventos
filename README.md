# help by Ine — ManageEventos

Agenda móvil para una persona que organiza ambientaciones de cumpleaños. Interfaz en español argentino, almacenamiento local y sin cuentas ni servidor. Identidad visual: **help by Ine**, sin los motivos florales de temporada.

## Funciones

- Crear y editar eventos con temática, contacto, fecha, hora, lugar y notas.
- Agregar hasta seis fotos por evento desde la galería, verlas ampliadas y quitarlas al editar. Se guardan copias JPEG optimizadas (hasta 1280 px y 600 KB de texto base64 por imagen), sin modificar los originales. Los cambios se confirman con **Guardar cambios**.
- Monto total y seña opcionales; vacío significa pendiente de acordar y cero es un valor válido. Moneda inicial: ARS.
- Inicio con próximos eventos y acceso a la semana actual (lunes a domingo).
- Navegar por semanas, incluyendo días sin eventos.
- Consultar contactos autorizados del teléfono y guardar contactos nuevos de forma optativa. No se importa toda la agenda al almacenamiento de la app.
- Confirmación con papel picado después de guardar; respeta movimiento reducido.
- Exportar y restaurar copias JSON. La restauración combina eventos por identificador; los de la copia prevalecen si el identificador coincide. Validación antes de escribir.

## Desarrollo

El cliente está en `src/client`. Usa Angular 21 y Capacitor 8. Se eligió Angular 21 porque es compatible con Node 22.17 instalado en este equipo. No hay backend en esta etapa.

```powershell
cd src/client
npm ci
npm start
```

Abrir `http://localhost:4200`. Los contactos del teléfono se prueban en una compilación nativa; en el navegador se permite ingreso manual. Los datos del navegador y los de cada instalación nativa son independientes.

```powershell
npm run build
npx cap sync
```

Los proyectos nativos están en `src/client/android` y `src/client/ios`. Para Android se necesita Android Studio y su SDK. Para compilar y firmar iOS se necesita un Mac con Xcode. No se incluyen credenciales ni certificados de publicación.

```powershell
npx cap open android
# En macOS:
npx cap open ios
```

## Almacenamiento y permisos

Capacitor Filesystem guarda eventos y fotos en un archivo privado de la aplicación (`Directory.Data`). En el navegador usa IndexedDB. La versión anterior almacenaba eventos en Preferences: se leen automáticamente cuando todavía no existe el archivo nuevo y se conservan al guardar por primera vez. La clave anterior queda intacta como resguardo de migración. No desinstalar la app para actualizarla.

Las escrituras pasan por un archivo temporal antes de reemplazar la agenda. Se esperan antes de mostrar confirmación. Si falla la lectura inicial, se bloquea el guardado para proteger los datos originales. No hay sincronización ni copias automáticas: exportar una copia periódicamente y antes de desinstalar la app. Las copias JSON incluyen las fotos y aceptan importaciones de hasta 100 MB; siguen siendo compatibles con copias anteriores sin fotos.

La selección de fotos usa el selector nativo de Capacitor Camera en Android/iOS y selección de archivos en el navegador. Solo se guardan las imágenes elegidas dentro de cada evento; no se suben a un servidor. En iOS está declarado el motivo de acceso a la fototeca. Android utiliza el selector del sistema sin solicitar acceso general a toda la galería.

**Buscar en agenda** abre el selector nativo para elegir un número y su contacto; no requiere leer toda la agenda. Se mantiene el ingreso manual si se cancela o falla la selección. Crear un contacto es optativo y solicita autorización de escritura. La creación es posterior al guardado del evento: si falla, se avisa que el evento se conservó. Editar un evento no modifica automáticamente el contacto del teléfono.

Las copias contienen datos personales de los contactos seleccionados y deben guardarse en un lugar privado. No están cifradas por la aplicación.

## Validación pendiente de dispositivo

Antes de distribuir: probar en dispositivos reales la selección de fotos, cancelación del selector y persistencia al cerrar la app; verificar selección de contactos y cancelación del selector; creación con permisos aceptados, denegados y limitados en Android/iOS; comprobar compartir/restaurar copias, persistencia al cerrar y abrir, teclado y áreas seguras. Luego definir nombre definitivo, icono, identificador y firma de publicación.

## Comprobaciones

```powershell
cd src/client
npm run check:style
npm test
npm run mobile:sync
```

Las pruebas usan Chrome instalado en el equipo y contextos aislados, sin cuentas, servidor ni datos reales. Cubren guardado sin importes, persistencia al recargar, edición con seña cero, vista semanal, cambio de año, fallos de almacenamiento, contacto manual, migración desde la versión anterior y fotos (selección, persistencia, ampliación, eliminación y respaldo/restauración). Las capturas se guardan en `src/client/test-results` (ignorado por Git).

El proyecto contiene ajustes de dependencias transitivas para las versiones corregidas de Vite, MCP SDK y UUID. `.npmrc` evita un fallo del resolvedor de dependencias opcionales de npm 10; el archivo de versiones mantiene la instalación reproducible.

Referencias: [Capacitor](https://capacitorjs.com/docs/getting-started), [plugin de contactos](https://capgo.app/docs/plugins/contacts/).
