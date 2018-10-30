import mongoose from 'mongoose';

const Model3DScheme = new mongoose.Schema({
    name: { type: String, required: true },
    tags: { type: [String], required: false },
});

const Model3D = mongoose.model('Model3D', Model3DScheme);
