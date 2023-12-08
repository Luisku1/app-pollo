import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import employeeRouter from './routes/employee.route.js'
import authRouter from './routes/auth.route.js'
import roleRouter from './routes/role.route.js'
import companyRouter from './routes/company.route.js'
import outgoingRouter from './routes/outgoing.route.js'
import branchRouter from './routes/branch.route.js'
import zoneRouter from './routes/zone.route.js'
import productRouter from './routes/product.route.js'
import priceRouter from './routes/price.route.js'
import stockRouter from './routes/stock.route.js'

const app = express()

const PORT = 3000

dotenv.config( { path: '../.env' } )

mongoose.connect(process.env.MONGO).then(() =>
{
    console.log('Connected to MongoDB')

}).catch((err) => {

    console.log(err)
})

app.use(express.json())
app.use(cookieParser())

app.listen(PORT, () =>
{
    console.log('Server is running on port ' + PORT + '!');
})

app.use('/api/employee', employeeRouter)
app.use('/api/auth', authRouter)
app.use('/api/role', roleRouter)
app.use('/api/company', companyRouter)
app.use('/api/outgoing', outgoingRouter)
app.use('/api/branch', branchRouter)
app.use('/api/zone', zoneRouter)
app.use('/api/product', productRouter)
app.use('/api/product/price', priceRouter)
app.use('/api/stock', stockRouter)

app.use((err, req, res, next) => {

    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal Server Error'

    return res.status(statusCode).json({

        success: false,
        statusCode,
        message,
    })
})