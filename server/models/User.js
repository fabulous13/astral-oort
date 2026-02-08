import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    approvedAt: { type: Date }
});

export default mongoose.model('User', UserSchema);
