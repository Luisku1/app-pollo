import Role from '../models/role.model.js'
import { errorHandler } from '../utils/error.js'

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

export const getRoles = async (req, res, next) => {

    try {

        const roles = await Role.find({})
        res.status(200).json({ roles })

    } catch (error) {

        return next(errorHandler(401, "Undefined error"))
    }
}