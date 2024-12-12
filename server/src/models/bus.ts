import mongoose, { Document, Model, Schema } from 'mongoose';

interface BusDocument extends Document {
    name: string;
    source: string;
    destination: string;
    departure_time: string;
    arrival_time: string;
   
    
}

const busSchema = new Schema<BusDocument>({
    name: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    departure_time: {
        type: String,
        required: true
    },
    arrival_time: {
        type: String,
        required: true,
        unique: true
    },
    
   
}, { timestamps: true });

const Bus: Model<BusDocument> = mongoose.model('Bus', busSchema);

export default Bus;
