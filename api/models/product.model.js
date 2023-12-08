import mongoose, { Schema } from 'mongoose'

const productSchema = mongoose.Schema( {

    name: {
        type: String,
        required: true,
        unique: true
    },

    company: {
        type: Schema.Types.ObjectId, ref: 'Company',
        required: true,
    }

}, { timestamps: true } )

const Product = mongoose.model('Product', productSchema)

export default Product