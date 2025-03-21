'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  ColumnsProps,
  CustomTable,
  CustomTableProps,
  RowsProps,
} from '../custom/custom-table';
import { ImageUrlsProps } from '@/utils/img-urls';
import { CustomImage } from '../custom/custom-image';

export type SelectableTableColumnKeysProps<ColumnKeysProps> =
  | 'INDEX'
  | ColumnKeysProps
  | 'ACTIONS';

type SelectableTableProps<ColumnKeysProps> = {
  rows: CustomTableProps<ColumnKeysProps>['rows'];
  columns: CustomTableProps<ColumnKeysProps>['columns'];
  onEndReached?: CustomTableProps<
    SelectableTableColumnKeysProps<ColumnKeysProps>
  >['onEndReached'];
  initialSelectedRows: RowsProps<ColumnKeysProps>;
  getSelectedRows?: (selectedRows: RowsProps<ColumnKeysProps>) => void;
};

const SelectIcon = function <ColumnKeysProps>({
  id,
  row,
  selectedRows,
  setSelectedRows,
}: {
  id: number;
  row: RowsProps<ColumnKeysProps>[0];
  selectedRows: RowsProps<ColumnKeysProps>;
  setSelectedRows: Dispatch<SetStateAction<RowsProps<ColumnKeysProps>>>;
}) {
  const selected = selectedRows.find(
    (selectedRow) => (selectedRow as any).INDEX === id,
  );
  const icon = (selected ? 'CHECK_ICON' : 'PLUS_ICON') as ImageUrlsProps;
  const handleSelect = () => {
    // If its already selected, remove it
    const currentRowId: any = (row as any).ID;
    const isAlreadyIncluded = selectedRows.some(
      (row: any) => row.ID === currentRowId,
    );
    if (currentRowId && isAlreadyIncluded) {
      const filteredRows = selectedRows.filter(
        (row: any) => row.ID !== currentRowId,
      );

      setSelectedRows([...filteredRows]);
      return;
    }

    setSelectedRows([...(selectedRows || []), row]);
  };

  return (
    <div className="flex justify-center items-center cursor-pointer w-6 h-8">
      <CustomImage
        imageKey={icon}
        width={25}
        height={25}
        onClick={handleSelect}
      />
    </div>
  );
};

export function SelectableTable<ColumnKeysProps>({
  columns: _columns,
  rows: _rows,
  onEndReached,
  initialSelectedRows,
  getSelectedRows,
}: SelectableTableProps<ColumnKeysProps>) {
  const mapRows = (rows: RowsProps<ColumnKeysProps>) => {
    return rows.map((row, index) => {
      const id = (row as any)?.INDEX || ++index;
      return {
        INDEX: id,
        ...row,
        ACTIONS: (
          <SelectIcon
            id={id}
            row={row}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        ),
      };
    });
  };

  const [selectedRows, setSelectedRows] = useState<
    RowsProps<SelectableTableColumnKeysProps<ColumnKeysProps>>
  >([]);
  const [rows, setRows] = useState(mapRows(_rows));

  const columns: ColumnsProps<SelectableTableColumnKeysProps<ColumnKeysProps>> =
    [
      { label: '#', id: 'INDEX', minWidth: 30 },
      ..._columns,
      { label: '', id: 'ACTIONS', align: 'center', minWidth: 30 },
    ];

  const getMergedRows = (
    rows: CustomTableProps<
      SelectableTableColumnKeysProps<ColumnKeysProps>
    >['rows'],
  ) => {
    const selectedExcludedRows = rows.filter(
      (row) =>
        !selectedRows.some((selectedRow) => selectedRow.INDEX === row.INDEX),
    );

    const mergedRows = mapRows([...selectedRows, ...selectedExcludedRows]);
    return mergedRows;
  };

  useEffect(() => {
    const mergedRows = getMergedRows(
      _rows as CustomTableProps<
        SelectableTableColumnKeysProps<ColumnKeysProps>
      >['rows'],
    );

    setRows(mergedRows.length ? mergedRows : mapRows(_rows));
  }, [_rows]); // Re-execute the rows in case the "_rows" prop changes (e.g. when the rows are being fetched)

  useEffect(() => {
    const mergedRows = getMergedRows(rows);

    getSelectedRows?.(selectedRows);
    setRows(mergedRows);
  }, [selectedRows]);

  useEffect(() => {
    if (initialSelectedRows?.length) {
      setSelectedRows(mapRows(initialSelectedRows));
    }
  }, [initialSelectedRows]);

  return (
    <CustomTable<ColumnKeysProps>
      rows={rows}
      columns={columns as ColumnsProps<ColumnKeysProps>}
      onEndReached={onEndReached}
      height={310}
      elevation={0}
      className="flex flex-col min-h-[50vh] sm:min-h-[35vh]"
    />
  );
}
