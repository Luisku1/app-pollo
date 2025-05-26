import { useEffect, useState } from 'react';
import { currency, isNumeric } from '../helpers/Functions';
import PropTypes from 'prop-types';

const allColumns = [
  {
    field: 'supervisor',
    header: 'Supervisor',
    screen: 0,
    column: (value) => (
      <span className={value ? '' : 'text-red-600'}>
        {value?.name + ' ' + value?.lastName}
      </span>
    )
  },
  {
    field: 'grossIncomes',
    header: 'Ingresos Brutos',
    screen: 667,
    column: (_, row) => (
      currency({ amount: row.cash + row.deposits + row.terminalIncomes })
    )
  },
  {
    field: 'extraOutgoings',
    header: 'Gastos',
    screen: 0,
    column: (value) => currency({ amount: value })
  },
  {
    field: 'toVerify',
    header: 'Ingresos a Verificar',
    screen: 0,
    column: (_, row) => (
      <span className={`font-bold`}>
        {currency({ amount: row.cash + row.deposits + row.terminalIncomes - row.extraOutgoings })}
      </span>
    )
  },
  {
    field: 'verifiedIncomes',
    header: 'Ingresos Verificados',
    screen: 0,
    column: (_, row) => {
      return (
        <span className={`${(row.verifiedDeposits + row.verifiedCash) < row?.cash + row.deposits + row.terminalIncomes - row.extraOutgoings ? 'text-red-600' : ''}`}>
          {currency(row.verifiedCash + row.verifiedDeposits ?? 0)}
        </span>
      )
    }
  },
  {
    field: 'balance',
    header: 'Balance',
    screen: 0,
    column: (value) => (
      <span className={value < 0 ? 'text-red-500' : 'text-green-600'}>
        {currency({ amount: value })}
      </span>
    )
  },
];

const SupervisorReportTable = ({ supervisorReports, onRowClick, totals }) => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const visibleColumns = allColumns.filter(column => column.screen <= screenWidth);
      setColumns(visibleColumns);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!supervisorReports || supervisorReports.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-2xl">Aún no hay información de tus supervisores</p>
      </div>
    )
  }

  return (
    <div>
      <div className="border  w-fit justify-self-center rounded-lg overflow-x-auto mt-2">
        <table className={' bg-white mx-auto w-full'}>
          <thead className="border border-black">
            <tr>
              {columns.map((col) => (
                <th key={col.field} onClick={() => { totals?.[col.field]?.onClick() }} className={`text-sm ${totals?.[col.field]?.onClick ? 'cursor-pointer' : ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {supervisorReports.map((supervisorReport, index) => (
              <tr
                key={supervisorReport._id}
                className={`border-x ${index + 1 !== supervisorReports.length ? 'border-b ' : ''} border-black border-opacity-40 ${index % 2 === 0 ? 'bg-gray-200 bg-opacity-75' : ''} cursor-pointer`}
                onClick={() => {
                  onRowClick(supervisorReport);
                }}
              >
                {columns.map((col) => (
                  <td key={col.field} className="text-center text-sm">
                    {col.column(supervisorReport[col.field], supervisorReport) ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-black text-sm py-2">
            <tr>
              {columns.map((col) => {
                const sampleValue = supervisorReports[0]?.[col.field];
                const isNumericField = isNumeric(sampleValue);
                const totalValue = isNumericField
                  ? totals?.[col.field] ?? 0
                  : totals?.[col.field] ?? '';
                const text = totals?.[col.field]?.text ?? '';
                return (
                  <td key={col.field} className={`text-center text-m font-semibold ${text}`}>
                    {totalValue}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

SupervisorReportTable.propTypes = {
  supervisorReports: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func.isRequired,
  totals: PropTypes.object.isRequired,
};

export default SupervisorReportTable;
