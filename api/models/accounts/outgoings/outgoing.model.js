import { Decimal128 } from 'mongodb'
import mongoose, {Schema} from 'mongoose'

const outgoingSchema = mongoose.Schema ( {

    amount: {
        type: String,
        required: true
    },

    concept: {
        type: String,
        required: true
    },

    branch: {
        type: Schema.Types.ObjectId, ref: 'Branch',
        required: true
    }

}, { timestamps: true } )

const Outgoing = mongoose.model('Outgoing', outgoingSchema)

export default Outgoing