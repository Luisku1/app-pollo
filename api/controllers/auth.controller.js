import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Employee from '../models/employees/employee.model.js'
import Role from '../models/role.model.js'
import { errorHandler } from '../utils/error.js'
import EmployeeDailyBalance from '../models/employees/employee.daily.balance.js'
import { newCompanyFunction } from './company.controller.js'
import { addDailyBalanceInWeeklyBalance } from './employee.controller.js'
import { Types } from 'mongoose'

export const registerEmployee = async (req, res, next) => {
  let role = req.body.role;
  const { name, lastName, password, salary, payDay, company, phoneNumber, balance, administrativeAccount } = req.body;

  if (!password) {
    next(errorHandler(404, 'The password path is required'));
    return;
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  try {
    // companies y defaultCompany
    const companies = [company];
    const defaultCompany = company;

    // companyData para el nuevo modelo
    const companyData = [{
      company,
      salary,
      role,
      payDay,
      balance,
      administrativeAccount: administrativeAccount ?? false
    }];

    const newEmployeeData = {
      name,
      lastName,
      password: hashedPassword,
      phoneNumber,
      companies,
      defaultCompany,
      companyData
    };

    const newEmployee = new Employee(newEmployeeData);

    const employeeDailyBalance = new EmployeeDailyBalance({
      employee: newEmployee._id,
      company: defaultCompany,
      createdAt: (new Date().toISOString())
    });

    await newEmployee.save();
    await employeeDailyBalance.save();
    await addDailyBalanceInWeeklyBalance(employeeDailyBalance);

    if (employeeDailyBalance && newEmployee) {
      res.status(201).json('New employee created successfully');
    } else {
      res.status(404).json('An error ocurred');
    }

  } catch (error) {
    next(error);
  }
}

export const ownerSignUp = async (req, res, next) => {
  const { name, lastName, phoneNumber, company: paramsCompany, password } = req.body;

  try {
    if (!password) {
      next(errorHandler(404, 'The password path is required'));
      return;
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const role = await Role.findOne({ name: 'Contralor' }).select('_id');
    const newEmployee = new Employee({
      name,
      lastName,
      password: hashedPassword,
      phoneNumber,
      companies: [],
      companyData: []
    });

    const company = await newCompanyFunction({ name: paramsCompany, ownerId: newEmployee._id });

    newEmployee.companies = [company._id];
    newEmployee.defaultCompany = company._id;
    newEmployee.companyData = [{
      company: company._id,
      salary: 0,
      payDay: undefined,
      balance: 0.0,
      role: role._id,
      administrativeAccount: true
    }];

    const employeeDailyBalance = new EmployeeDailyBalance({ employee: newEmployee._id, company: newEmployee.defaultCompany, createdAt: (new Date().toISOString()) });
    await newEmployee.save();
    await employeeDailyBalance.save();

    if (employeeDailyBalance && newEmployee) {
      res.status(201).json('New employee created succesfully');
    } else {
      res.status(404).json('An error ocurred');
    }

  } catch (error) {
    next(error);
  }
}

export const changeCompany = async (req, res, next) => {
  const { companyId } = req.body;
  try {
    const updatedUser = await Employee.findByIdAndUpdate(
      req.body.userId,
      { defaultCompany: companyId },
      { new: true }
    );
    if (!updatedUser) return next(errorHandler(404, 'User not found'));

    const userId = updatedUser._id;
    const companyObjectId = new Types.ObjectId(companyId);

    // Asegurar que companies incluye companyId
    if (!updatedUser.companies?.some(c => c.toString() === companyId)) {
      updatedUser.companies = [...(updatedUser.companies || []), companyObjectId];
      await updatedUser.save();
    }

    // Si no existe entry en companyData para companyId, crearla con datos legacy (mantiene compatibilidad)
    const companyDataEntry = updatedUser.companyData?.find(cd => cd.company?.toString() === companyId);
    if (!companyDataEntry) {
      updatedUser.companyData.push({
        company: companyObjectId,
        salary: updatedUser.salary ?? 0,
        payDay: updatedUser.payDay ?? null,
        balance: updatedUser.balance ?? 0,
        administrativeAccount: updatedUser.administrativeAccount ?? false,
        role: updatedUser.role || null // puede ser null; validación del schema exige role, se asume ya existe
      });
      console.log(updatedUser)
      try {
        await updatedUser.save();
      } catch (e) {
        // Si falla por role requerido, intentar asignar primer role existente
        if (/`role` is required/.test(e.message)) {
          const anyRole = await Role.findOne({ name: 'Contralor' }, '_id');
          if (anyRole) {
            const idx = updatedUser.companyData.findIndex(cd => cd.company?.toString() === companyId);
            if (idx > -1) updatedUser.companyData[idx].role = anyRole._id;
            await updatedUser.save();
          }
        } else throw e;
      }
    }

    // Aggregate para devolver formato nuevo (filtra companyData a la compañía y deriva campos)
    const aggregated = await Employee.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },
      {
        $addFields: {
          companyData: {
            $filter: {
              input: '$companyData',
              as: 'cd',
              cond: { $eq: ['$$cd.company', companyObjectId] }
            }
          }
        }
      },
      {
        $addFields: {
          salary: { $arrayElemAt: ['$companyData.salary', 0] },
          payDay: { $arrayElemAt: ['$companyData.payDay', 0] },
          balance: { $arrayElemAt: ['$companyData.balance', 0] },
          role: { $arrayElemAt: ['$companyData.role', 0] },
          administrativeAccount: { $arrayElemAt: ['$companyData.administrativeAccount', 0] }
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'companies',
          foreignField: '_id',
          as: 'companies'
        }
      },
      { $project: { password: 0 } }
    ]);

    const employee = aggregated[0] || updatedUser.toObject();
    res.status(200).json({ employee });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  const { phoneNumber, password } = req.body;
  try {
    // Usuario base
    let user = await Employee.findOne({ phoneNumber });
    if (!user) return next(errorHandler(404, 'Número de teléfono o contraseña incorrectos.'));
    if (!user.active) return next(errorHandler(404, 'Tu perfil no se encuentra activo. Pide a algún gerente reactivarlo.'));

    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) return next(errorHandler(401, 'Contraseña equivocada.'));

    // Determinar compañía objetivo (defaultCompany o primera disponible)
    let targetCompanyId = user.defaultCompany || user.companies?.[0] || user.company;
    if (!targetCompanyId) {
      // Si no hay ninguna compañía asociada no podemos derivar companyData
      return next(errorHandler(400, 'El usuario no tiene compañía asociada.'));
    }

    const targetCompanyObjectId = new Types.ObjectId(targetCompanyId);

    // Asegurar que companies contiene la defaultCompany
    if (!user.companies?.some(c => c.toString() === targetCompanyId.toString())) {
      user.companies = [...(user.companies || []), targetCompanyObjectId];
      await user.save();
    }

    // Asegurar entry en companyData para la compañía objetivo
    let cdEntry = user.companyData?.find(cd => cd.company?.toString() === targetCompanyId.toString());
    if (!cdEntry) {
      user.companyData.push({
        company: targetCompanyObjectId,
        salary: user.salary ?? 0,
        payDay: user.payDay ?? null,
        balance: user.balance ?? 0,
        administrativeAccount: user.administrativeAccount ?? false,
        role: user.role || null
      });
      try {
        await user.save();
      } catch (e) {
        if (/`role` is required/.test(e.message)) {
          const anyRole = await Role.findOne({}, '_id');
          if (anyRole) {
            const idx = user.companyData.findIndex(cd => cd.company?.toString() === targetCompanyId.toString());
            if (idx > -1) user.companyData[idx].role = anyRole._id;
            await user.save();
          }
        } else throw e;
      }
    }

    // Aggregate para devolver formato normalizado
    const aggregated = await Employee.aggregate([
      { $match: { _id: user._id } },
      {
        $addFields: {
          companyData: {
            $filter: {
              input: '$companyData',
              as: 'cd',
              cond: { $eq: ['$$cd.company', targetCompanyObjectId] }
            }
          }
        }
      },
      {
        $addFields: {
          salary: { $arrayElemAt: ['$companyData.salary', 0] },
          payDay: { $arrayElemAt: ['$companyData.payDay', 0] },
          balance: { $arrayElemAt: ['$companyData.balance', 0] },
          role: { $arrayElemAt: ['$companyData.role', 0] },
          administrativeAccount: { $arrayElemAt: ['$companyData.administrativeAccount', 0] }
        }
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role'
        }
      },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'companies',
          localField: 'companies',
          foreignField: '_id',
          as: 'companies'
        }
      },
      { $project: { password: 0 } }
    ]);

    const employee = aggregated[0];
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json({ employee });
  } catch (error) {
    next(error);
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