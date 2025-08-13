import { useEffect, useState } from 'react';
import { currency, isNumeric } from '../helpers/Functions';
import PropTypes from 'prop-types';

const allColumns = [
	{
		field: 'customer',
		header: 'Cliente',
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
		field: 'salesAmount',
		header: 'Ventas',
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

const CustomerReportTable = ({ customerReports, onRowClick, totals }) => {
	const [columns, setColumns] = useState([]);

	useEffect(() => {
		const handleResize = () => {
			const screenWidth = window.innerWidth;

			// Filter columns based on the visible fields for the current range
			const visibleColumns = allColumns.filter((column) => column.screen <= screenWidth);
			setColumns(visibleColumns);
		};

		handleResize(); // Initial check
		window.addEventListener('resize', handleResize);

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	if (!customerReports || customerReports.length === 0) {
		return (
			<div className="flex justify-center items-center h-96">
				<p className="text-2xl">Aún no hay información de tus clientes</p>
			</div>
		);
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
					{customerReports.map((customerReport, index) => (
						<tr
							key={customerReport._id}
							className={`transition hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} cursor-pointer`}
							onClick={() => {
								onRowClick(customerReport);
							}}
						>
							{columns.map((col) => (
								<td key={col.field} className="px-3 py-2 text-center align-middle">
									{col.column(customerReport[col.field], customerReport) ?? ''}
								</td>
							))}
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr className="bg-blue-100 font-bold">
						{columns.map((col) => {
							const sampleValue = customerReports[0]?.[col.field];
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

CustomerReportTable.propTypes = {
	customerReports: PropTypes.arrayOf(PropTypes.object).isRequired,
	onRowClick: PropTypes.func.isRequired,
	totals: PropTypes.object.isRequired,
};

export default CustomerReportTable;
