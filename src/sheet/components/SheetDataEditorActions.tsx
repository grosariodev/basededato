import { useState } from 'preact/hooks';
import {
  ConfirmationModal,
  Input,
  Select,
  Tooltip,
  Spinner,
} from '@/components';
import { downloadSheetAsCsv, removeDuplicates } from '@/utils';
import {
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useTranslations } from '@/i18';
import {
  ImporterValidationError,
  RemoveRowsPayload,
  EnumLabelDict,
  SheetDefinition,
  SheetRow,
  SheetViewMode,
  TranslationKey,
} from '@/types';
import { useImporterDefinition } from '@/importer/hooks';
import { useImporterState } from '@/importer/reducer';

interface Props {
  sheetDefinition: SheetDefinition;
  rowData: SheetRow[];
  selectedRows: SheetRow[];
  setSelectedRows: (rows: SheetRow[]) => void;
  viewMode: SheetViewMode;
  setViewMode: (mode: SheetViewMode) => void;
  searchPhrase: string;
  setSearchPhrase: (searchPhrase: string) => void;
  errorColumnFilter: string | null;
  setErrorColumnFilter: (mode: string | null) => void;
  removeRows: (payload: RemoveRowsPayload) => void;
  addEmptyRow: () => void;
  sheetValidationErrors: ImporterValidationError[];
  rowValidationSummary: Record<SheetViewMode, number>;
  resetState: () => void;
  enumLabelDict: EnumLabelDict;
  scrollToRow?: ((rowIndex: number) => void) | null;
}

export default function SheetDataEditorActions({
  sheetDefinition,
  rowData,
  selectedRows,
  setSelectedRows,
  viewMode,
  setViewMode,
  searchPhrase,
  setSearchPhrase,
  errorColumnFilter,
  setErrorColumnFilter,
  removeRows,
  addEmptyRow,
  sheetValidationErrors,
  rowValidationSummary,
  resetState,
  enumLabelDict,
  scrollToRow,
}: Props) {
  const { csvDownloadMode, availableActions } = useImporterDefinition();
  const { t } = useTranslations();

  const { validationInProgress } = useImporterState();

  const [removeConfirmationModalOpen, setRemoveConfirmationModalOpen] =
    useState(false);
  const [resetConfirmationModalOpen, setResetConfirmationModalOpen] =
    useState(false);
  const [errorsPanelOpen, setErrorsPanelOpen] = useState(false);

  const disabledButtonClasses =
    'pointer-events-none cursor-not-allowed opacity-50';

  function errorFilterOption(columnId: string) {
    const columnDefinition = sheetDefinition.columns.find(
      (c) => c.id === columnId
    );

    const count = removeDuplicates(
      sheetValidationErrors
        .filter((error) => error.columnId === columnId)
        .map((row) => row.rowIndex)
    ).length;

    return {
      label: `${columnDefinition?.label || columnId} (${count})`,
      value: columnId,
    };
  }

  const filterByErrorOptions = removeDuplicates(
    sheetValidationErrors.map((error) => error.columnId)
  ).map((columnId) => errorFilterOption(columnId));

  if (
    errorColumnFilter != null &&
    filterByErrorOptions.find((option) => option.value === errorColumnFilter) ==
      null
  ) {
    filterByErrorOptions.push(errorFilterOption(errorColumnFilter));
  }

  function onRemoveRows() {
    removeRows({ rows: selectedRows, sheetId: sheetDefinition.id });
    setSelectedRows([]);
  }

  const formatCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <div className="flex flex-col">
      {/* Summary bar: All | Valid | Invalid (Flatfile-style) */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRows([]);
            setViewMode('all');
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            viewMode === 'all'
              ? 'bg-gray-200 text-gray-900'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('sheet.all')} {formatCount(rowValidationSummary.all)}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRows([]);
            setViewMode('valid');
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            viewMode === 'valid'
              ? 'bg-hello-csv-success-extra-light text-hello-csv-success'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          }`}
        >
          {t('sheet.valid')} {formatCount(rowValidationSummary.valid)}
        </button>
        <button
          type="button"
          onClick={() => {
            setSelectedRows([]);
            setViewMode('errors');
          }}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
            viewMode === 'errors'
              ? 'bg-hello-csv-danger-extra-light text-hello-csv-danger'
              : 'bg-transparent text-gray-600 hover:bg-gray-100'
          } ${rowValidationSummary.errors > 0 ? 'text-hello-csv-danger' : ''}`}
        >
          {t('sheet.invalid')} {formatCount(rowValidationSummary.errors)}
        </button>
        {sheetValidationErrors.length > 0 && (
          <button
            type="button"
            onClick={() => setErrorsPanelOpen((o) => !o)}
            className="ml-2 flex items-center gap-1.5 rounded-md border border-hello-csv-danger-extra-light bg-hello-csv-danger-extra-light px-3 py-1.5 text-sm font-medium text-hello-csv-danger hover:bg-red-100"
          >
            {errorsPanelOpen ? (
              <ChevronDownIcon className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            )}
            {t('sheet.invalid')} list ({sheetValidationErrors.length})
          </button>
        )}
      </div>

      {/* Errors list panel: click to scroll to row */}
      {errorsPanelOpen && sheetValidationErrors.length > 0 && (
        <div className="max-h-48 overflow-y-auto border-b border-gray-200 bg-red-50/50 px-4 py-2">
          <p className="mb-2 text-xs font-medium text-gray-600">
            Click a row to scroll to it in the table.
          </p>
          <ul className="space-y-1 text-sm">
            {sheetValidationErrors.map((err, i) => {
              const colLabel =
                sheetDefinition.columns.find((c) => c.id === err.columnId)
                  ?.label ?? err.columnId;
              return (
                <li key={`${err.rowIndex}-${err.columnId}-${i}`}>
                  <button
                    type="button"
                    onClick={() => scrollToRow?.(err.rowIndex)}
                    className="flex w-full items-start gap-2 rounded px-2 py-1 text-left text-hello-csv-danger hover:bg-red-100"
                  >
                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      <strong>Row {err.rowIndex + 1}</strong>, {colLabel}:{' '}
                      {t(err.message as TranslationKey)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Toolbar: Filter, Search, Actions */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Select
          clearable
          displayPlaceholderWhenSelected
          placeholder={t('sheet.filterByError')}
          classes="min-w-40"
          options={filterByErrorOptions}
          value={errorColumnFilter}
          onChange={(value) => setErrorColumnFilter(value as string)}
        />
        {availableActions.includes('search') && (
          <Input
            clearable
            value={searchPhrase}
            onChange={(v) => setSearchPhrase(v as string)}
            placeholder={t('sheet.search')}
            iconBuilder={(props) => <MagnifyingGlassIcon {...props} />}
          />
        )}
        <div className="flex items-center gap-1">
          {availableActions.includes('removeRows') && (
            <Tooltip
              tooltipText={t(
                selectedRows.length <= 0
                  ? 'sheet.removeRowsTooltipNoRowsSelected'
                  : 'sheet.removeRowsTooltip'
              )}
            >
              <TrashIcon
                role="button"
                tabIndex={0}
                aria-label={t(
                  selectedRows.length <= 0
                    ? 'sheet.removeRowsTooltipNoRowsSelected'
                    : 'sheet.removeRowsTooltip'
                )}
                className={`h-5 w-5 ${selectedRows.length > 0 ? 'cursor-pointer text-gray-600 hover:text-gray-900' : disabledButtonClasses}`}
                onClick={() => setRemoveConfirmationModalOpen(true)}
              />
            </Tooltip>
          )}
          {availableActions.includes('addRows') && (
            <Tooltip tooltipText={t('sheet.addRowsTooltip')}>
              <PlusIcon
                className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-900"
                onClick={addEmptyRow}
              />
            </Tooltip>
          )}
          {availableActions.includes('downloadCsv') && (
            <Tooltip tooltipText={t('sheet.downloadSheetTooltip')}>
              <ArrowDownTrayIcon
                className={`h-5 w-5 ${
                  rowData.length > 0 ? 'cursor-pointer text-gray-600 hover:text-gray-900' : disabledButtonClasses
                }`}
                onClick={() =>
                  downloadSheetAsCsv(
                    sheetDefinition,
                    rowData,
                    enumLabelDict,
                    csvDownloadMode
                  )
                }
              />
            </Tooltip>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {validationInProgress && (
            <>
              <Spinner color="dark" />
              <span className="text-xs text-gray-500">Validating…</span>
            </>
          )}
          {availableActions.includes('resetState') && (
            <>
              <Tooltip tooltipText={t('sheet.resetTooltip')}>
                <XMarkIcon
                  className="h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-900"
                  onClick={() => setResetConfirmationModalOpen(true)}
                />
              </Tooltip>
              <ConfirmationModal
                open={resetConfirmationModalOpen}
                setOpen={setResetConfirmationModalOpen}
                onConfirm={resetState}
                title={t('sheet.resetConfirmationModalTitle')}
                confirmationText={t(
                  'sheet.resetConfirmationModalConfirmationText'
                )}
                subTitle={t('sheet.resetConfirmationModalSubTitle')}
                variant="danger"
              />
            </>
          )}
        </div>
        {availableActions.includes('removeRows') && (
          <ConfirmationModal
            open={removeConfirmationModalOpen}
            setOpen={setRemoveConfirmationModalOpen}
            onConfirm={onRemoveRows}
            title={t('sheet.removeConfirmationModalTitle')}
            confirmationText={t(
              'sheet.removeConfirmationModalConfirmationText'
            )}
            subTitle={t('sheet.removeConfirmationModalSubTitle', {
              rowsCount: selectedRows.length,
            })}
            variant="danger"
          />
        )}
      </div>
    </div>
  );
}
