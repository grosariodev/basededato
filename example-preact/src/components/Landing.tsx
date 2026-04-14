/**
 * Landing page: value proposition, benefits, and CTA (Flatfile-style strategy, adapted to our product).
 */
interface Props {
  onProbarDemo: () => void;
}

export default function Landing({ onProbarDemo }: Props) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fafafa]">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-16 pb-32 md:px-12 lg:px-20">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0a0a0a 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-neutral-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Preparación de datos · Validación en tiempo real
          </div>
          <h1 className="mb-6 max-w-3xl font-semibold tracking-tight text-neutral-900 text-5xl leading-[1.1] md:text-6xl lg:text-7xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Prepara, mapea y valida
            <br />
            <span className="bg-gradient-to-r from-neutral-700 to-neutral-500 bg-clip-text text-transparent">
              los datos que mueven tu negocio.
            </span>
          </h1>
          <p className="mb-10 max-w-xl text-lg text-neutral-600 md:text-xl">
            La forma más directa de recibir archivos de tus clientes, alinear columnas, limpiar y transformar valores,
            y validar contra tus reglas antes de que nada llegue al backend.
          </p>
          <button
            type="button"
            onClick={onProbarDemo}
            className="group inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-8 py-4 text-base font-medium text-white shadow-lg shadow-neutral-900/20 transition hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/25 active:scale-[0.98]"
          >
            Probar demo
            <svg
              className="h-5 w-5 transition group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Value: structured data from files */}
      <section className="border-t border-neutral-200/80 bg-white px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Datos estructurados desde cualquier archivo
          </h2>
          <p className="mb-16 max-w-2xl text-lg text-neutral-600">
            Soporta carga por archivo (CSV y más). El flujo guía al usuario a mapear columnas, revisar la vista previa
            y corregir errores antes de confirmar el envío.
          </p>
          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-8 md:p-12">
            <p className="text-neutral-600">
              Sube un archivo → asocia cada columna con el campo esperado → revisa y edita en la tabla →
              valida en tiempo real → confirma y envía. Todo en el navegador, sin que los datos salgan de tu control.
            </p>
          </div>
        </div>
      </section>

      {/* Map your data */}
      <section className="border-t border-neutral-200/80 bg-[#fafafa] px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Mapea tus datos en segundos
          </h2>
          <p className="mb-16 max-w-2xl text-lg text-neutral-600">
            No importa cómo vengan los encabezados del archivo. Tú defines el esquema esperado y el usuario
            elige qué columna del archivo corresponde a cada campo. Así reduces errores y reenvíos.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Esquema por producto</h3>
              <p className="text-neutral-600">
                Define columnas obligatorias, tipos y reglas por producto (préstamos, tarjetas, etc.).
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">Vista previa inmediata</h3>
              <p className="text-neutral-600">
                Tras mapear, se muestra la tabla con los datos. El usuario puede editar celdas y ver errores al instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enforce data standards */}
      <section className="border-t border-neutral-200/80 bg-white px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Aplica tus reglas de negocio en tiempo real
          </h2>
          <p className="mb-16 max-w-2xl text-lg text-neutral-600">
            Cuando los datos entran en la tabla, se validan contra tus reglas: campos obligatorios, formatos (fechas,
            cédulas, teléfonos), rangos y catálogos. Los errores se marcan en la celda para que el usuario corrija antes de enviar.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Validación', desc: 'Campos requeridos, formatos y longitudes. Fechas con mes/día válidos y rango permitido.' },
              { title: 'Transformación', desc: 'Normaliza fechas a un solo formato, teléfonos a 10 dígitos, montos a decimal y categorías a códigos.' },
              { title: 'Sin envío con errores', desc: 'Puedes bloquear la confirmación hasta que no queden errores, o permitir envío parcial según tu política.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-6">
                <h3 className="mb-2 font-semibold text-neutral-900">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Save time */}
      <section className="border-t border-neutral-200/80 bg-[#fafafa] px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Ahorra tiempo en la preparación de datos
          </h2>
          <p className="mb-16 max-w-2xl text-lg text-neutral-600">
            En lugar de plantillas rígidas o scripts a medida, un solo flujo: el usuario sube, mapea, corrige y envía.
            Tú defines las reglas una vez; el sistema las aplica en cada importación.
          </p>
          <p className="max-w-2xl text-neutral-600">
            Sin obligar a un formato único de archivo: aceptas variaciones (encabezados distintos, formatos de fecha o moneda)
            y normalizas automáticamente antes de que los datos lleguen a tu backend.
          </p>
        </div>
      </section>

      {/* Implement with or without code */}
      <section className="border-t border-neutral-200/80 bg-white px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Integra con o sin código
          </h2>
          <p className="mb-16 max-w-2xl text-lg text-neutral-600">
            Incluye el importador en tu app con una llamada: defines el esquema (columnas, validadores y transformadores)
            y lo montas en tu página. Funciona con React, Preact o con un script en una página HTML. Los datos
            se envían a tu backend cuando el usuario confirma; tú decides el endpoint y la lógica.
          </p>
          <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50 p-8">
            <p className="text-neutral-600">
              Configuración flexible: reglas por columna, valores por defecto, mapeo de categorías y validación
              cruzada (por ejemplo, longitud de cédula según tipo de entidad). Todo definible en código y adaptable a tu dominio.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-neutral-200/80 bg-neutral-100 px-6 py-24 md:px-12 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
            Pruébalo con datos reales
          </h2>
          <p className="mb-10 text-lg text-neutral-600">
            Sube un CSV con columnas de préstamos y revisa validaciones y transformaciones en vivo.
          </p>
          <button
            type="button"
            onClick={onProbarDemo}
            className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-8 py-4 text-base font-medium text-white shadow-lg transition hover:bg-neutral-800 active:scale-[0.98]"
          >
            Probar demo
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto max-w-6xl text-center text-sm text-neutral-500">
          Preparación y validación de datos · Frontend only · Los datos no salen de tu aplicación hasta que tú los envíes
        </div>
      </footer>
    </div>
  );
}
