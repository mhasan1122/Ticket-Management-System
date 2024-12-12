import mongoose, { Document, Model, Schema } from 'mongoose';

interface TicketDocument extends Document {
    bus: mongoose.Types.ObjectId; 
    price: number;  
    time_slot: string; 
    seats_available: number;  
    date: string; 
}

const ticketSchema = new Schema<TicketDocument>({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    time_slot: {
        type: String,
        required: true
    },
    seats_available: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Ticket: Model<TicketDocument> = mongoose.model('Ticket', ticketSchema);

export default Ticket;
