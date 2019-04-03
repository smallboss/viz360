import mongoose from 'mongoose';

import ServerConfig from '../../config/config.json';
import '../models/Model3D.mjs';

const Model3D = mongoose.model('Model3D');

export function setUpConnection() {
    // mongoose.Promise = require('bluebird');
    const db_path = `mongodb://sb:01286693q@ds259499.mlab.com:59499/viz360`;
    // const db_path = `mongodb://${ServerConfig.db.host}:${ServerConfig.db.port}/${ServerConfig.db.name}`;
    mongoose.connect(db_path, { useNewUrlParser: true })
        .catch(err => {
            console.log(err.message);
            console.log(`Please run mongodb on [${ServerConfig.db.host}:${ServerConfig.db.port}] and run server`);
            console.log(process.exit());
        });
}

export function getModel3DList() {
    return Model3D.find();
}


export function createModel3D( newModel3DData ) {

    const model3D = new Model3D({
        name : newModel3DData.name,
        url  : newModel3DData.url,
        tags : newModel3DData.tags
    });

    return model3D.save();
}


export function getModel3D( _id ) {
    return Model3D.findOne({ _id }, (err, user) =>{});
}


export function editModel3D( modelData ) {

    Model3D.findOne({ _id: modelData._id }, (err, model3d) =>{
        model3d.name = modelData.name;
        model3d.tags = modelData.tags;
        return model3d.save();
    });
}


// export function addPassword(login, passwordItem) {
//     return UserAcc.findOne({ login }, (err, user) =>{
//         user.passwordList.unshift(passwordItem);
//         return user.save();
//     });
// }
//
//
// export function removePassword(login, passwordIndex) {
//     return UserAcc.findOne({ login }, (err, user) =>{
//         user.passwordList.splice(passwordIndex, 1);
//         return user.save();
//     });
// }
//
//
// export function editPassword(login, passwordIndex, passwordItem) {
//     return UserAcc.findOne({ login }, (err, user) => {
//         user.passwordList.splice(passwordIndex, 1, passwordItem);
//         return user.save();
//     });
// }
//
//
// export function removeAllUsers() {
//     UserAcc.remove({}, function(err) {
//         console.log('Collection UserAcc removed');
//     });
// }


export function deleteModel3D( _id ) {
    return Model3D.deleteOne({ _id });
}