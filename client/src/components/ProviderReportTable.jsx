import { useEffect, useState } from 'react';
import { currency, isNumeric } from '../helpers/Functions';
import PropTypes from 'prop-types';

const allColumns = [
  {
    field: 'provider',
    header: 'Proveedor',
    screen: 0,
    column: (value) => <span className={value ? '' : 'text-red-600'}>{value?.name}</span>,
  },
  {
    field: 'previousBalance',
    header: 'Balance Anterior',
    screen: 768,
    column: (value) => currency({ amount: value }),
  },
  {
    field: 'returns',
    header: 'Devoluciones',
    screen: 768,
    column: (value) => currency({ amount: value }),
  },
  {
    field: 'movements',
    header: 'Compras',
    screen: 1024,
    column: (value) => currency({ amount: value }),
  },
  {
    field: 'payments',
    header: 'Pagos',
    screen: 1024,
    column: (value) => currency({ amount: value }),
  },
  {
    field: 'balance',
    header: 'Balance',
    screen: 0,
    column: (value) => (
      <span className={value < 0 ? 'text-red-500' : 'text-green-600'}>
        {currency({ amount: value })}
      </span>
    ),
  },
];

const ProviderReportTable = ({ providerReports, onRowClick, totals }) => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      const visibleColumns = allColumns.filter((column) => column.screen <= screenWidth);
      setColumns(visibleColumns);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  console.log('ProviderReportTable', providerReports, columns);

  if (!providerReports || providerReports.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-2xl">Aún no hay información de tus proveedores</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto mt-2">
      <table className={' bg-white mx-auto w-full'}>
        <thead className="border border-black">
          <tr>
            {columns.map((col) => (
              <th
                key={col.field}
                onClick={() => {
                  totals?.[col.field]?.onClick && totals[col.field].onClick();
                }}
                className={`text-sm ${totals?.[col.field]?.onClick ? 'cursor-pointer text' : ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {providerReports.map((providerReport, index) => (
            <tr
              key={providerReport._id}
              className={`border-x ${
                index + 1 !== providerReports.length ? 'border-b ' : ''
              } border-black border-opacity-40 ${
                index % 2 === 0 ? 'bg-gray-200 bg-opacity-75' : ''
              } cursor-pointer`}
              onClick={() => {
                onRowClick(providerReport);
              }}
            >
              {columns.map((col) => (
                <td key={col.field} className="text-center text-sm">
                  {col.column(providerReport[col.field], providerReport) ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-black text-sm py-2">
          <tr>
            {columns.map((col) => {
              const sampleValue = providerReports[0]?.[col.field];
              const isNumericField = isNumeric(sampleValue);
              const totalValue = isNumericField
                ? totals?.[col.field] ?? 0
                : totals?.[col.field] ?? '';
              const text = totals?.[col.field]?.text ?? '';
              return (
                <td
                  key={col.field}
                  className={`text-center text-m font-semibold ${text}`}
                >
                  {totalValue}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

ProviderReportTable.propTypes = {
  providerReports: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func.isRequired,
  totals: PropTypes.object.isRequired,
};

export default ProviderReportTable;
