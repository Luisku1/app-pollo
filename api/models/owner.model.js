import mongoose, {Schema} from 'mongoose'

const ownerSchema = mongoose.Schema( {

    email: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    phoneNumber: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: Schema.Types.ObjectId, ref: 'Role',
        required: true
    }

}, { timestamps: true } )

const Owner = mongoose.model('Owner', ownerSchema)

export default Owner