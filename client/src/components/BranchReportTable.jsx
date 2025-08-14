import { useEffect, useState } from 'react';
import { currency, isNumeric } from '../helpers/Functions';
import PropTypes from 'prop-types';

const allColumns = [
	{
		field: 'branch',
		header: 'Sucursal',
		screen: 0,
		column: (value, row) => (
			<span className={row.employee ? '' : 'text-red-600' + `${row.balance < 0 ? ' bg-blue-200 rounded-lg px-1' : ''}`}>
				{value.branch}
			</span>
		)
	},
	{
		field: 'employee',
		header: 'Empleado',
		screen: 768,
		column: (value) => (
			<span className={value ? '' : 'text-red-600'}>
				{value?.name}
			</span>
		)
	},
	{
		field: 'providerInputs',
		header: 'Proveedor',
		screen: 768,
		column: (value) => (
			<span className='text-red-600'>
				{currency({ amount: value })}
			</span>
		)
	},
	{
		field: 'initialStock',
		header: 'Anterior',
		screen: 768,
		column: (value) => (
			<span className='text-red-600'>
				{currency({ amount: value })}
			</span>
		)
	},
	{
		field: 'inputs',
		header: 'Entradas',
		screen: 1024,
		column: (value) => (
			<span className='text-red-600'>
				{currency({ amount: value })}
			</span>
		)
	},
	{
		field: 'outputs',
		header: 'Salidas',
		screen: 1024,
		column: (value) => currency({ amount: value })
	},
	{
		field: 'outgoings',
		header: 'Gastos',
		screen: 768,
		column: (value) => currency({ amount: value })
	},
	{
		field: 'finalStock',
		header: 'Sobrante',
		screen: 0,
		column: (value) => currency({ amount: value })
	},
	{
		field: 'incomes',
		header: 'Efectivo',
		screen: 0,
		column: (value) => currency({ amount: value })
	},
	{
		field: 'balance',
		header: 'Balance',
		screen: 0,
		column: (value) => (
			<span className={value < 0 ? 'text-red-500' : 'text-green-600'}>
				{value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
			</span>
		)
	}
];

const BranchReportTable = ({ branchReports, onRowClick, totals }) => {
	const [columns, setColumns] = useState([]);

	useEffect(() => {
		const handleResize = () => {
			const screenWidth = window.innerWidth;

			// Filter columns based on the visible fields for the current range
			const visibleColumns = allColumns.filter(column => column.screen <= screenWidth);
			setColumns(visibleColumns);
		};

		handleResize(); // Initial check
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []); // Removed allColumns from dependencies

	if (!branchReports || branchReports.length === 0) {
		return (
			<div className="flex justify-center items-center h-96">
				<p className="text-2xl">Aún no hay información de tus sucursales</p>
			</div>
		)
	}

	return (
		<div className="overflow-x-auto rounded-2xl shadow-md bg-white mt-2">
			<table className="min-w-full text-sm">
				<thead>
					<tr className="bg-gray-100 uppercase text-xs text-gray-700">
						{columns.map((col) => (
							<th
								key={col.field}
								onClick={() => { totals?.[col.field]?.onClick && totals[col.field].onClick(); }}
								className={`px-3 py-2 font-bold tracking-wide text-left ${totals?.[col.field]?.onClick ? 'cursor-pointer hover:underline' : ''}`}
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{branchReports.map((branchReport, rowIdx) => (
						<tr
							key={branchReport._id}
							className={`transition hover:bg-blue-50 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} cursor-pointer`}
							onClick={() => {
								onRowClick(branchReport);
							}}
						>
							{columns.map((col) => (
								<td key={col.field} className={`px-3 py-2 text-center align-middle`}>
									{col.column(branchReport[col.field], branchReport) ?? ''}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr className="bg-blue-100 font-bold">
						{columns.map((col) => {
							const sampleValue = branchReports[0]?.[col.field];
							const isNumericField = isNumeric(sampleValue);
							const onClick = totals?.[col.field]?.onClick;
							const totalValue = isNumericField
								? totals?.[col.field]?.value ?? totals?.[col.field] ?? 0
								: totals?.[col.field]?.value ?? totals?.[col.field] ?? '';
							const text = totals?.[col.field]?.text ?? '';

							return (
								<td
									key={col.field}
									className={`px-3 py-2 text-center text-m font-semibold ${text} ${onClick ? 'cursor-pointer hover:underline' : ''}`}
									onClick={() => {
										if (onClick) {
											onClick();
										}
									}}
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

BranchReportTable.propTypes = {
	branchReports: PropTypes.arrayOf(PropTypes.object).isRequired,
	onRowClick: PropTypes.func.isRequired,
	totals: PropTypes.object.isRequired,
};

export default BranchReportTable;
