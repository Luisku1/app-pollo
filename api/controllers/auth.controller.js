import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Employee from '../models/employees/employee.model.js'
import Role from '../models/role.model.js'
import { errorHandler } from '../utils/error.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { newCompanyFunction } from './company.controller.js'
import { addDailyBalanceInWeeklyBalance } from './employee.controller.js'

export const signUp = async (req, res, next) => {

  let role = req.body.role

  const { name, lastName, password, salary, payDay, company, phoneNumber, balance } = req.body

  if (!password) {

    next(errorHandler(404, 'The password path is required'))
    return
  }

  const hashedPassword = bcryptjs.hashSync(password, 10)

  let newEmployee

  try {

    if (balance) {

      newEmployee = new Employee({ name, lastName, password: hashedPassword, phoneNumber, role, salary, payDay, company, balance })

    } else {

      newEmployee = new Employee({ name, lastName, password: hashedPassword, phoneNumber, role, salary, payDay, company })
    }

    const employeeDailyBalance = new EmployeeDailyBalance({ employee: newEmployee._id, company: newEmployee.company, createdAt: (new Date().toISOString()) })
    await newEmployee.save()
    await employeeDailyBalance.save()

    await addDailyBalanceInWeeklyBalance(employeeDailyBalance)

    if (employeeDailyBalance && newEmployee) {

      res.status(201).json('New employee created successfully')

    } else {

      res.status(404).json('An error ocurred')
    }


  } catch (error) {

    next(error)
  }
}

export const ownerSignUp = async (req, res, next) => {

  const { name, lastName, phoneNumber, company: paramsCompany, password } = req.body

  try {
    if (!password) {

      next(errorHandler(404, 'The password path is required'))
      return
    }

    const hashedPassword = bcryptjs.hashSync(password, 10)
    const role = await Role.findOne({ name: 'Gerente' }).select('_id')
    const newEmployee = await Employee({ name, lastName, password: hashedPassword, role: role._id, phoneNumber })
    const company = await newCompanyFunction({ name: paramsCompany, ownerId: newEmployee._id })

    newEmployee.company = company._id
    const employeeDailyBalance = new EmployeeDailyBalance({ employee: newEmployee._id, company: newEmployee.company, createdAt: (new Date().toISOString()) })
    await newEmployee.save()
    await employeeDailyBalance.save()

    if(employeeDailyBalance && newEmployee) {

      res.status(201).json('New employee created succesfully')

    } else {

      res.status(404).json('An error ocurred')
    }

  } catch (error) {

    next(error)
  }
}

export const signIn = async (req, res, next) => {

  const { phoneNumber, password } = req.body

  try {

    let validUser = await Employee.findOne({ phoneNumber })

    if (!validUser) {

      return next(errorHandler(404, 'Número de teléfono o contraseña incorrectos.'))
    }

    if(!validUser.active) {

      return next(errorHandler(404, 'Tu perfil no se encuentra activo. Pide a algún gerente reactivarlo.'))
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password)

    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'))

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET)

    const { password: pass, ...rest } = validUser._doc

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest)

  } catch (error) {

    next(error)
  }
}

export const signOut = async (req, res, next) => {

  try {

    res.clearCookie('access_token')
    res.status(200).json('User has been logged out')

  } catch (error) {

    next(error)
  }
}