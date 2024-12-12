import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the interface for the TicketPurchase document
interface TicketPurchaseDocument extends Document {
    userId: mongoose.Types.ObjectId;   // Reference to the User who made the purchase
    busId: mongoose.Types.ObjectId;    // Reference to the Bus ticket (Ticket model)
    timeSlot: string;                   // Time slot of the bus ticket
    seatsPurchased: number;             // Number of seats purchased
    purchaseDate: Date;                 // Date when the purchase was made
}

// Define the schema for the TicketPurchase
const ticketPurchaseSchema = new Schema<TicketPurchaseDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference to the User model
        required: true
    },
    busId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',  // Reference to the Ticket model
        required: true
    },
    timeSlot: {
        type: String,
        required: true
    },
    seatsPurchased: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Create the TicketPurchase model
const TicketPurchase: Model<TicketPurchaseDocument> = mongoose.model('TicketPurchase', ticketPurchaseSchema);

export default TicketPurchase;
