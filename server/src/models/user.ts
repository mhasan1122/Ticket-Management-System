import mongoose, { Document, Model, Schema } from 'mongoose';

interface UserDocument extends Document {
    name: string;
    address: string;
    phone: string;
    password: string;
    email: string;
    photo?: string;
    
}

const userSchema = new Schema<UserDocument>({
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
        required: true,
        unique: true
    },
    photo: {
        type: String,
        required: false
    },
   
}, { timestamps: true });

const User: Model<UserDocument> = mongoose.model('User', userSchema);

export default User;
