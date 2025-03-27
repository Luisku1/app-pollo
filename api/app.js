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
import branchReportRouter from './routes/branch.report.route.js'
import productLossRouter from './routes/product.loss.route.js'
import outputRouter from './routes/output.route.js'
import inputRouter from './routes/input.route.js'
import incomeRouter from './routes/income.route.js'
import reportRouter from './routes/report.route.js'
import customerRouter from './routes/customer.route.js'
import providerRouter from './routes/provider.route.js'
import path from 'path'

const app = express()

const PORT = 3000

dotenv.config({ path: '../.env' })

mongoose.connect(process.env.MONGO).then(() => {
	console.log('Connected to MongoDB')

}).catch((err) => {

	console.log(err)
})

const __dirname = path.resolve()


app.use(express.json())
app.use(cookieParser())

app.listen(PORT, () => {
	console.log('Server is running on port ' + PORT + '!');
})

app.use('/api/employee', employeeRouter)
app.use('/api/customer', customerRouter)
app.use('/api/provider', providerRouter)
app.use('/api/auth', authRouter)
app.use('/api/role', roleRouter)
app.use('/api/company', companyRouter)
app.use('/api/outgoing', outgoingRouter)
app.use('/api/outgoing/product-loss', productLossRouter)
app.use('/api/branch', branchRouter)
app.use('/api/branch/report', branchReportRouter)
app.use('/api/product', productRouter)
app.use('/api/product/price', priceRouter)
app.use('/api/stock', stockRouter)
app.use('/api/zone', zoneRouter)
app.use('/api/output', outputRouter)
app.use('/api/input', inputRouter)
app.use('/api/income', incomeRouter)
app.use('/api/report', reportRouter)

app.use(express.static(path.join(__dirname, '/client/dist')))

app.get('*', (req, res) => {

	res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'))
})

app.use((err, req, res, next) => {

	const statusCode = err.statusCode || 500
	const message = err.message || 'Internal Server Error'

	return res.status(statusCode).json({

		success: false,
		statusCode,
		message,
	})
})