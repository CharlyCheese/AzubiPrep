export const SOURCE_BYTES = 64 * 1024;
export const initialJsDraft = () => ({ schema: 1, name: 'uebung.js', source: '// Dein erstes eigenes Programm\nconst begruessung = "Hallo JavaScript!";\nconsole.log(begruessung);\n' });

export function checkJsDraft(value) {
  if (!value || value.schema !== 1 || typeof value.name !== 'string' || !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,59}\.js$/.test(value.name)
      || typeof value.source !== 'string' || value.source.length > SOURCE_BYTES || new TextEncoder().encode(value.source).length > SOURCE_BYTES) {
    throw new Error('Bitte eine JavaScript-Datei mit einfachem Dateinamen und höchstens 64 KiB verwenden.');
  }
  return { schema: 1, name: value.name, source: value.source };
}
