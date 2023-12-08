import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Employee from '../models/employees/employee.model.js'
import Role from '../models/role.model.js'
import Owner from '../models/owner.model.js'
import { errorHandler } from '../utils/error.js'

export const signUp = async (req, res, next) => {
  const { name, lastName, email, password, role, salary, payDay } = req.body

  const hashedPassword = bcryptjs.hashSync(password, 10)

  const newEmployee = new Employee({ name, lastName, email, password: hashedPassword, role, salary, payDay })

  try {

    await newEmployee.save()
    res.status(201).json('New employee created successfully')

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

  const { email, password } = req.body

  try {

    let validUser = await Employee.findOne({ email })


    if (!validUser) {


      validUser = await Owner.findOne({ email })

      if (!validUser) {

        return next(errorHandler(404, 'Wrong credentials'))

      }
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

    console.log('error en signout')
    next(error)
  }
}