/**
 * Demo: full importer with Prestamo sheet (49 columns). "Volver" returns to landing.
 */
import { useState } from 'preact/hooks';
import Importer, { ImporterState } from 'hello-csv/preact';
import { PRESTAMO_SHEET } from '../config/prestamoSheet';

interface Props {
  onVolver: () => void;
}

export default function DemoPage({ onVolver }: Props) {
  const [ready, setReady] = useState(false);

  const onComplete = async (
    data: ImporterState,
    onProgress: (progress: number) => void
  ) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress(50);
    await new Promise((resolve) => setTimeout(resolve, 200));
    onProgress(100);
    console.log('Datos importados:', data);
    setReady(true);
    const totalRows = data.sheetData.reduce(
      (acc: number, sheet: { rows: unknown[] }) => acc + sheet.rows.length,
      0
    );
    return {
      totalRows,
      imported: totalRows,
      failed: 0,
      skipped: 0,
    };
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200/80 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 hover:border-neutral-300"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
        <span className="text-sm font-medium text-neutral-500">
          Demo · Préstamos (49 columnas)
        </span>
      </header>
      <main className="px-4 py-6 md:px-8">
        <div className="mx-auto max-w-[1600px] rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm md:p-6">
          <Importer
            allowManualDataEntry
            sheets={[PRESTAMO_SHEET]}
            onComplete={onComplete}
            preventUploadOnValidationErrors
            persistenceConfig={{ enabled: true }}
            csvDownloadMode="label"
          />
        </div>
        {ready && (
          <p className="mt-4 text-center text-sm text-neutral-500">
            Revisa la consola del navegador para ver los datos importados.
          </p>
        )}
      </main>
    </div>
  );
}
