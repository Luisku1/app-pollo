import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Employee from '../models/employees/employee.model.js'
import Role from '../models/role.model.js'
import { errorHandler } from '../utils/error.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'

export const signUp = async (req, res, next) => {

  let role = req.body.role

  const { name, lastName, email, password, salary, payDay, company, phoneNumber, balance } = req.body

  if (!password) {

    next(errorHandler(404, 'The password path is required'))
    return
  }

  const hashedPassword = bcryptjs.hashSync(password, 10)

  let newEmployee

  if (role === undefined) {

    role = await Role.findOne({ name: 'Gerente' }).select('_id')

  }

  console.log(email)

  if (balance) {

    if (email != undefined) {


      newEmployee = new Employee({ name, lastName, email, password: hashedPassword, phoneNumber, role, salary, payDay, company, balance })

    } else {

      newEmployee = new Employee({ name, lastName, password: hashedPassword, phoneNumber, role, salary, payDay, company, balance })

    }


  } else {

    if (email != undefined) {

      newEmployee = new Employee({ name, lastName, email, password: hashedPassword, phoneNumber, role, salary, payDay, company })

    } else {

      newEmployee = new Employee({ name, lastName, password: hashedPassword, phoneNumber, role, salary, payDay, company })
    }


  }

  try {

    const employeeDailyBalance = new EmployeeDailyBalance({ employee: newEmployee._id, company: newEmployee.company, createdAt: (new Date().toISOString()) })
    await newEmployee.save()
    await employeeDailyBalance.save()

    if (employeeDailyBalance && newEmployee) {

      res.status(201).json('New employee created successfully')

    } else {

      res.status(404).json('New employee created, but an error ocurred in the daily balance')
    }


  } catch (error) {

    next(error)
  }
}

export const ownerSignUp = async (req, res, next) => {

  const { name, lastName, email, password, phoneNumber } = req.body
  const hashedPassword = bcryptjs.hashSync(password, 10)

  try {

    const ownerRole = await Role.findOne({ name: 'Dueño' })
    const newOwner = new Owner({ name, lastName, email, password: hashedPassword, phoneNumber, role: ownerRole._id })


    await newOwner.save()
    res.status(201).json('New owner created successfully')

  } catch (error) {

    next(error)
  }
}

export const signIn = async (req, res, next) => {

  const { emailNumber, password } = req.body

  console.log(emailNumber, password)

  try {

    let validUser = await Employee.findOne({
      $or: [
        {
          phoneNumber: emailNumber
        },
        {
          email: {
            $regex: emailNumber, $options: 'i'
          }
        }
      ]
    })


    if (!validUser) {

      return next(errorHandler(404, 'Wrong credentials'))

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