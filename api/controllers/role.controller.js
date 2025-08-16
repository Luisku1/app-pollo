import Role from '../models/role.model.js'
import { errorHandler } from '../utils/error.js'

export const roleAggregate = (localField = 'role') => {
	return [
		{
			$lookup: {
				from: 'roles',
				localField: localField,
				foreignField: '_id',
				as: localField
			}
		},
		{
			$unwind: { path: `$${localField}`, preserveNullAndEmptyArrays: true }
		}
	]
}

export const newRole = async (req, res, next) => {

	const name = req.body.name

	const newRole = new Role({ name })

	try {

		await newRole.save()
		res.status(201).json('Role created successfully')

	} catch (error) {

		next(error)
	}
}

export const getMyPermissions = (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'No autorizado' })
	res.status(200).json({
		success: true,
		role: req.user.role,
		permissions: Array.from(req.user.permissions || [])
	})
}

export const getRoles = async (req, res, next) => {

	try {

		const roles = await fetchRolesFromDB()
		res.status(200).json({ roles })

	} catch (error) {

		next(errorHandler(500, error.message || "Error al obtener roles"))
	}
}

// export const getRoles = async (req, res, next) => {
// 	try {
// 		const roles = await Role.find({}, 'name displayName rank active permissions').lean()
// 		res.status(200).json({ roles })
// 	} catch (error) {
// 		next(errorHandler(500, error.message || "Error al obtener roles"))
// 	}
// }

export const fetchRolesFromDB = async () => {

	return await Role.find({})
}

const PERMISSIONS = {
	vendedor: [
		// 'income.read', 'income.create', ...
	],
	supervisor: [
		// 'income.read', 'income.create', ...
	],
	gerente: [
		// 'income.read.all', ...
	],
	contralor: [
		// 'report.read.financial', ...
	],
	administrador: [
		// 'role.update', 'system.audit.read', ...
	]
};

// Definición base de roles (usa los arrays de arriba)
export const ROLE_SEED = [
	{ name: 'vendedor', displayName: 'Vendedor', rank: 1, permissions: PERMISSIONS.vendedor },
	{ name: 'supervisor', displayName: 'Supervisor', rank: 2, permissions: PERMISSIONS.supervisor },
	{ name: 'gerente', displayName: 'Gerente', rank: 3, permissions: PERMISSIONS.gerente },
	{ name: 'contralor', displayName: 'Contralor', rank: 4, permissions: PERMISSIONS.contralor },
	{ name: 'administrador', displayName: 'Administrador', rank: 5, permissions: PERMISSIONS.administrador }
];

export const fillRoles = async () => {
	const results = [];
	for (const roleDef of ROLE_SEED) {
		const { name, displayName, rank, permissions } = roleDef;
		const cleanPerms = [...new Set((permissions || []).map(p => p.trim().toLowerCase()).filter(Boolean))];
		const doc = await Role.findOneAndUpdate(
			{ name },
			{
				$set: {
					displayName: displayName ?? name,
					rank,
					permissions: cleanPerms,
					active: true
				}
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		).lean();
		results.push({ name: doc.name, countPermissions: doc.permissions.length });
	}
	return results;
};

export const seedRolesEndpoint = async (req, res, next) => {
	try {
		const data = await fillRoles();
		res.status(200).json({ success: true, roles: data });
	} catch (e) {
		next(errorHandler(500, e.message || 'Error al sembrar roles'));
	}
};