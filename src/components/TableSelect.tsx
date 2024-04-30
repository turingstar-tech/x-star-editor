import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Executor } from 'x-star-editor';
import { prefix } from '../utils/global';

interface TableSelectProps {
  exec: Executor;
}

const TableSelect = (): TableSelectProps => {
  const [tableSize, setTableSize] = useState({ rows: 6, cols: 6 });
  const [selectedArea, setSelectedArea] = useState({ row: 0, col: 0 });
  console.log(selectedArea, 'selectedArea');

  useEffect(() => {
    const handleMouseMove = (e) => {
      const tableContainer = e.currentTarget;
      const rect = tableContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.min(Math.ceil(x / 20), tableSize.cols);
      const row = Math.min(Math.ceil(y / 20), tableSize.rows);

      setSelectedArea({ row, col });

      const newCols = Math.min(9, Math.max(tableSize.cols, col));
      const newRows = Math.min(9, Math.max(tableSize.rows, row));

      setTableSize({ cols: newCols, rows: newRows });
    };

    const tableContainer = document.getElementById('toolbar-table-container');
    tableContainer?.addEventListener('mousemove', handleMouseMove);

    return () => {
      tableContainer?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [tableSize]);

  const renderTable = () => {
    const { rows, cols } = tableSize;
    const { row: selRow, col: selCol } = selectedArea;
    let table = [];

    for (let i = 1; i <= rows; i++) {
      let row = [];
      for (let j = 1; j <= cols; j++) {
        const isSelected = i <= selRow && j <= selCol;
        const tableCellClass = classNames(`${prefix}-toolbar-table-cell`);
        const selectedClass = isSelected
          ? classNames(`${prefix}-toolbar-table-cell-selected`)
          : classNames();
        row.push(
          <td key={j} className={`${tableCellClass} ${selectedClass}`}></td>,
        );
      }
      table.push(<tr key={i}>{row}</tr>);
    }

    return <tbody>{table}</tbody>;
  };

  return (
    <div className={classNames(`${prefix}-toolbar-table-container-wrap`)}>
      <div
        id="toolbar-table-container"
        className={classNames(`${prefix}-toolbar-table-container`)}
      >
        {renderTable()}
      </div>
      <div>
        {selectedArea.row}*{selectedArea.col}
      </div>
    </div>
  );
};

export default TableSelect;
