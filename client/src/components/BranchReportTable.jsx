import { useEffect, useState } from 'react';
import { currency, isNumeric } from '../helpers/Functions';
import PropTypes from 'prop-types';

const allColumns = [
	{
		field: 'branch',
		header: 'Sucursal',
		screen: 0,
		column: (value, row) => (
			<span className={row.employee ? '' : 'text-red-600'}>
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
		screen: 0,
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
		<div className="border rounded-lg mx-auto w-fit overflow-x-auto mt-2">
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
					{branchReports.map((branchReport, index) => (
						<tr
							key={branchReport._id}
							className={`border-x ${index + 1 !== branchReports.length ? 'border-b ' : ''} border-black border-opacity-40 ${index % 2 === 0 ? 'bg-gray-200 bg-opacity-75' : ''} cursor-pointer`}
							onClick={() => {
								onRowClick(branchReport);
							}}
						>
							{columns.map((col) => (
								<td key={col.field} className="text-center text-sm">
									{col.column(branchReport[col.field], branchReport) ?? ''}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot className="border-t border-black text-sm py-2">
					<tr>
						{columns.map((col) => {
							const sampleValue = branchReports[0]?.[col.field]; // Infer type
							const isNumericField = isNumeric(sampleValue);
							const onClick = totals?.[col.field]?.onClick;
							const totalValue = isNumericField
								? totals?.[col.field]?.value ?? totals?.[col.field] ?? 0
								: totals?.[col.field]?.value ?? totals?.[col.field] ?? '';
							const text = totals?.[col.field]?.text ?? '';

							return (
								<td key={col.field} className={`text-center text-m font-semibold ${text} ${onClick ? 'cursor-pointer' : ''}`}
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
