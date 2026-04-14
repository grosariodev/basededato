/**
 * Prestamo sheet: 49 columns with validators and transformers per DataIngest rules.
 * Uses a local type compatible with hello-csv SheetDefinition so build works without parent dist.
 */
import type { SheetDefinition } from 'hello-csv/preact';
import {
  sanitizeText,
  dateToYyyyMmDd,
  isValueValidDate,
  phoneDR,
  moneyTruncate,
  mapMoneda,
  mapRelacionTipo,
  mapEstatus,
  type SheetRow,
} from './prestamoRules';

const sanitizeTransformer = {
  transformer: 'custom' as const,
  key: 'sanitize',
  transformFn: (value: string | number | boolean | undefined) =>
    value === undefined || value === null || value === ''
      ? undefined
      : sanitizeText(value),
};

/** Normalizes to YYYYMMDD when valid; returns original value when invalid so validator can show error. */
const dateTransformer = {
  transformer: 'custom' as const,
  key: 'date_yyyymmdd',
  transformFn: (value: string | number | boolean | undefined) => {
    const raw = value === undefined || value === null ? undefined : String(value);
    if (raw === undefined || raw === '') return undefined;
    const normalized = dateToYyyyMmDd(raw.trim() === '' ? undefined : raw);
    if (normalized !== undefined) return normalized;
    return value;
  },
};

/** Normalizes to 10-digit DR phone when valid; returns original when invalid so validator can show error. */
const phoneTransformer = {
  transformer: 'custom' as const,
  key: 'phone_dr',
  transformFn: (value: string | number | boolean | undefined) => {
    const raw = value === undefined || value === null ? undefined : String(value);
    if (raw === undefined || raw === '') return undefined;
    const normalized = phoneDR(raw.trim() === '' ? undefined : raw);
    if (normalized !== undefined) return normalized;
    return value;
  },
};

/** Truncates to 2 decimals when valid; returns original when invalid so validator can show error. */
const moneyTransformer = {
  transformer: 'custom' as const,
  key: 'money_truncate',
  transformFn: (value: string | number | boolean | undefined) => {
    const raw = value === undefined || value === null ? undefined : String(value);
    if (raw === undefined || raw === '') return undefined;
    const normalized = moneyTruncate(raw.trim() === '' ? undefined : raw);
    if (normalized !== undefined) return normalized;
    return value;
  },
};

const monedaTransformer = {
  transformer: 'custom' as const,
  key: 'moneda',
  transformFn: (value: string | number | boolean | undefined) =>
    mapMoneda(value === undefined || value === null ? undefined : String(value)),
};

const relacionTipoTransformer = {
  transformer: 'custom' as const,
  key: 'relacion_tipo',
  transformFn: (value: string | number | boolean | undefined) =>
    mapRelacionTipo(value === undefined || value === null ? undefined : String(value)),
};

const estatusTransformer = {
  transformer: 'custom' as const,
  key: 'estatus',
  transformFn: (value: string | number | boolean | undefined) =>
    mapEstatus(value === undefined || value === null ? undefined : String(value)),
};

export const PRESTAMO_SHEET = {
  id: 'prestamo',
  label: 'Préstamos',
  columns: [
    {
      label: 'TIPO_ENTIDAD',
      id: 'tipo_entidad',
      type: 'string',
      validators: [
        { validate: 'required', error: 'TIPO_ENTIDAD es obligatorio' },
        {
          validate: 'custom',
          key: 'tipo_entidad_p_e',
          validateFn: (val: unknown, _row: SheetRow) => {
            const v = String(val ?? '').trim().toUpperCase();
            if (!v) return undefined;
            if (v !== 'P' && v !== 'E') return 'TIPO_ENTIDAD debe ser exactamente P (Persona Física) o E (Persona Jurídica).';
            return undefined;
          },
        },
      ],
      transformers: [sanitizeTransformer],
    },
    {
      label: 'NOMBRE',
      id: 'nombre',
      type: 'string',
      validators: [{ validate: 'required', error: 'NOMBRE es obligatorio' }],
      transformers: [sanitizeTransformer],
    },
    {
      label: 'APELLIDO',
      id: 'apellido',
      type: 'string',
      transformers: [sanitizeTransformer],
    },
    {
      label: 'CEDULA_O_RNC',
      id: 'cedula_o_rnc',
      type: 'string',
      validators: [
        { validate: 'required', error: 'CEDULA_O_RNC es obligatorio' },
        {
          validate: 'custom',
          key: 'cedula_length',
          validateFn: (val: unknown, row: SheetRow) => {
            const str = String(val ?? '').trim();
            const digits = str.replace(/\D/g, '');
            const tipo = String(row.tipo_entidad ?? '').trim().toUpperCase();
            if (tipo !== 'P' && tipo !== 'E') return undefined;
            if (tipo === 'P') {
              if (digits.length !== 11) return 'Persona Física (P): CEDULA_O_RNC debe tener exactamente 11 dígitos.';
            }
            if (tipo === 'E') {
              if (digits.length !== 9) return 'Persona Jurídica (E): CEDULA_O_RNC debe tener exactamente 9 dígitos.';
            }
            if (str.length > 0 && /\D/.test(str)) return 'CEDULA_O_RNC debe contener solo números (sin guiones ni espacios).';
            return undefined;
          },
        },
      ],
      transformers: [
        { transformer: 'strip' },
        {
          transformer: 'custom',
          key: 'cedula_digits',
          transformFn: (v: string | number | boolean | undefined) =>
            v != null ? String(v).replace(/\D/g, '') : undefined,
        },
      ],
    },
    {
      label: 'SEXO',
      id: 'sexo',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'sexo_f_m',
          validateFn: (val: unknown) => {
            const v = String(val ?? '').trim().toUpperCase();
            if (!v) return undefined;
            if (v !== 'F' && v !== 'M') return 'Debe ser F o M';
            return undefined;
          },
        },
      ],
      transformers: [sanitizeTransformer],
    },
    {
      label: 'ESTADO_CIVIL',
      id: 'estado_civil',
      type: 'string',
      validators: [
        {
          validate: 'includes',
          values: ['S', 'C', 'U', 'D', 'V'],
          error: 'Debe ser S, C, U, D o V',
        },
      ],
      transformers: [sanitizeTransformer],
    },
    { label: 'OCUPACION', id: 'ocupacion', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'CODIGO_DE_CLIENTE', id: 'codigo_de_cliente', type: 'string', transformers: [sanitizeTransformer] },
    {
      label: 'FECHA_NACIMIENTO',
      id: 'fecha_nacimiento',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'fecha_valida',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            if (!isValueValidDate(val)) return 'Fecha inválida: use YYYYMMDD o DD/MM/YYYY; mes 1-12, día válido para el mes, y fecha ≤ hoy.';
            return undefined;
          },
        },
      ],
      transformers: [dateTransformer],
    },
    { label: 'NACIONALIDAD', id: 'nacionalidad', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'DIRECCION', id: 'direccion', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'SECTOR', id: 'sector', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'CALLE_NUMERO', id: 'calle_numero', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'MUNICIPIO', id: 'municipio', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'CIUDAD', id: 'ciudad', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'PROVINCIA', id: 'provincia', type: 'string', transformers: [sanitizeTransformer] },
    { label: 'PAIS', id: 'pais', type: 'string', transformers: [sanitizeTransformer] },
    {
      label: 'TELEFONO1',
      id: 'telefono1',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'phone_dr',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            const v = phoneDR(String(val));
            if (!v) return 'Teléfono inválido: 10 dígitos con prefijo 809, 829 o 849; o 7 dígitos (el primero no puede ser 0 ni 1).';
            return undefined;
          },
        },
      ],
      transformers: [phoneTransformer],
    },
    {
      label: 'TELEFONO2',
      id: 'telefono2',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'phone_dr2',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            const v = phoneDR(String(val));
            if (!v) return 'Teléfono inválido: 10 dígitos (809/829/849) o 7 dígitos válidos.';
            return undefined;
          },
        },
      ],
      transformers: [phoneTransformer],
    },
    { label: 'EMPRESA_DONDE_TRABAJA', id: 'empresa_donde_trabaja', type: 'string', transformers: [sanitizeTransformer] },
    {
      label: 'MONEDA_SALARIO',
      id: 'moneda_salario',
      type: 'string',
      transformers: [sanitizeTransformer, monedaTransformer],
    },
    {
      label: 'SALARIO_MENSUAL',
      id: 'salario_mensual',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'RELACION_TIPO',
      id: 'relacion_tipo',
      type: 'string',
      validators: [
        { validate: 'required', error: 'RELACION_TIPO es obligatorio' },
        {
          validate: 'includes',
          values: ['DE', 'CO'],
          error: 'Debe ser Deudor (DE) o Codeudor (CO)',
        },
      ],
      transformers: [sanitizeTransformer, relacionTipoTransformer],
    },
    {
      label: 'FECHA_APERTURA',
      id: 'fecha_apertura',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'fecha_apertura',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            if (!isValueValidDate(val)) return 'Fecha inválida: mes 1-12, día válido para el mes, fecha ≤ hoy.';
            return undefined;
          },
        },
      ],
      transformers: [dateTransformer],
    },
    {
      label: 'FECHA_VENCIMIENTO',
      id: 'fecha_vencimiento',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'fecha_vencimiento',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            if (!isValueValidDate(val)) return 'Fecha inválida: mes 1-12, día válido para el mes, fecha ≤ hoy.';
            return undefined;
          },
        },
      ],
      transformers: [dateTransformer],
    },
    {
      label: 'FECHA_ULTIMO_PAGO',
      id: 'fecha_ultimo_pago',
      type: 'string',
      validators: [
        {
          validate: 'custom',
          key: 'fecha_ultimo_pago',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            if (!isValueValidDate(val)) return 'Fecha inválida: mes 1-12, día válido para el mes, fecha ≤ hoy.';
            return undefined;
          },
        },
      ],
      transformers: [dateTransformer],
    },
    {
      label: 'NUMERO_CUENTA',
      id: 'numero_cuenta',
      type: 'string',
      validators: [{ validate: 'required', error: 'NUMERO_CUENTA es obligatorio' }],
      transformers: [sanitizeTransformer],
    },
    {
      label: 'ESTATUS',
      id: 'estatus',
      type: 'string',
      validators: [
        { validate: 'required', error: 'ESTATUS es obligatorio' },
        {
          validate: 'includes',
          values: ['N', 'A', 'C'],
          error: 'Debe ser N (Normal), A (Atraso) o C (Castigado/Saldado)',
        },
      ],
      transformers: [sanitizeTransformer, estatusTransformer],
    },
    {
      label: 'TIPO_PRESTAMO',
      id: 'tipo_prestamo',
      type: 'string',
      validators: [{ validate: 'required', error: 'TIPO_PRESTAMO es obligatorio' }],
      transformers: [sanitizeTransformer],
    },
    {
      label: 'MONEDA',
      id: 'moneda',
      type: 'string',
      validators: [
        { validate: 'required', error: 'MONEDA es obligatorio' },
        { validate: 'includes', values: ['DO', 'US'], error: 'Debe ser DO o US' },
      ],
      transformers: [sanitizeTransformer, monedaTransformer],
    },
    {
      label: 'CREDITO_APROBADO',
      id: 'credito_aprobado',
      type: 'number',
      validators: [
        { validate: 'required', error: 'CREDITO_APROBADO es obligatorio' },
        {
          validate: 'custom',
          key: 'credito_aprobado_numero',
          validateFn: (val: unknown) => {
            if (val === undefined || val === null || String(val).trim() === '') return undefined;
            const num = parseFloat(String(val).replace(/,/g, ''));
            if (Number.isNaN(num)) return 'CREDITO_APROBADO debe ser un número válido.';
            if (num < 0) return 'CREDITO_APROBADO no puede ser negativo.';
            return undefined;
          },
        },
      ],
      transformers: [moneyTransformer],
    },
    {
      label: 'MONTO_ADEUDADO',
      id: 'monto_adeudado',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PAGO_MANDATORIO_O_CUOTA',
      id: 'pago_mandatorio_o_cuota',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'MONTO_ULTIMO_PAGO',
      id: 'monto_ultimo_pago',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'TOTAL_EN_ATRASO',
      id: 'total_en_atraso',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'TASA_DE_INTERES',
      id: 'tasa_de_interes',
      type: 'number',
      transformers: [moneyTransformer],
    },
    { label: 'FORMA_DE_PAGO', id: 'forma_de_pago', type: 'string', transformers: [sanitizeTransformer] },
    {
      label: 'CANTIDAD_DE_CUOTAS',
      id: 'cantidad_de_cuotas',
      type: 'number',
      validators: [
        {
          validate: 'is_integer',
          error: 'Debe ser un número entero',
        },
      ],
    },
    {
      label: 'PERIODO_DE_ATRASO_1',
      id: 'periodo_de_atraso_1',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_2',
      id: 'periodo_de_atraso_2',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_3',
      id: 'periodo_de_atraso_3',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_4',
      id: 'periodo_de_atraso_4',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_5',
      id: 'periodo_de_atraso_5',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_6',
      id: 'periodo_de_atraso_6',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_7',
      id: 'periodo_de_atraso_7',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_8',
      id: 'periodo_de_atraso_8',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_9',
      id: 'periodo_de_atraso_9',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'PERIODO_DE_ATRASO_10',
      id: 'periodo_de_atraso_10',
      type: 'number',
      transformers: [moneyTransformer],
    },
    {
      label: 'CUENTA_DE_REFERENCIA',
      id: 'cuenta_de_referencia',
      type: 'string',
      transformers: [sanitizeTransformer],
    },
  ],
} satisfies SheetDefinition;
