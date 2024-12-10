import mongoose, { Document, Model, Schema } from 'mongoose';

interface AdminDocument extends Document {
    name: string;
    address: string;
    phone: string;
    password: string;
    email: string;
    photo:string;
    
}

const adminSchema = new Schema<AdminDocument>({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

    
    email: {
        type: String,
        required: true
    },

    photo: {
        type: String,
        required: false
    },

}, { timestamps: true });

const Admin: Model<AdminDocument> = mongoose.model('Admin', adminSchema);

export default Admin;