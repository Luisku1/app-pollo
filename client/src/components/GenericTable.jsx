import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const GenericTable = ({ columns, data, onRowClick }) => {

  const calculateColumnTotals = () => {
    return columns.map((column) => {
      if (column.calculateTotal) {
        return data.reduce((sum, row) => sum + (row[column.key] || 0), 0);
      }
      return null;
    });
  };

  const columnTotals = calculateColumnTotals();

  return (
    <table className="border mt-2 bg-white w-fit min-w-full">
      <thead className="border border-black">
        <tr>
          {columns.map((column) => (
            <th key={column.key} className={`text-sm text-center w-1/${columns.length}`}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className=''>
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={`border-x border-black border-opacity-40 ${rowIndex % 2 === 0 ? 'bg-gray-200 bg-opacity-75' : ''} w-`}
          >
            {columns.map((column) => (
              <td key={column.key} className={`text-center text-sm w-1/${columns.length} h-full py-1 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}>
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className={`${data.length % 2 === 0 ? 'bg-gray-200 bg-opacity-75' : ''} mt-2 border border-black border-opacity-40`}>
          {columns.map((column, index) => (
            <td key={column.key} className={`p-2 text-center text-sm font-bold w-1/${columns.length}`}>
              {columnTotals[index] !== null ? column.totalRender ? column.totalRender(columnTotals[index]) : columnTotals[index] : ''}
            </td>
          ))}
        </tr>
      </tfoot>
    </table>
  );
};

GenericTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func, // Optional custom render function for the column
      essential: PropTypes.bool, // Flag to mark essential columns
      calculateTotal: PropTypes.bool, // Flag to calculate total for the column
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func, // Optional row click handler
};

export default GenericTable;
