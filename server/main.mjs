import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import util from 'util';

import ServerConfig from '../config/config.json';
import * as db from './utils/DBUtils';


db.setUpConnection();

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors({origin: '*'}));
app.use(ServerConfig.model3DStore, express.static( path.resolve(path.dirname('') + ServerConfig.model3DStore) ));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

// db.removeAllUsers();
// db.createModel3D({
//     name: 'FUR_Sofa002',
//     url:  'FUR_Sofa002.FBX',
//     tags: ['sofa', 'red', 'tag 3']
// });


app.post('/login', (req, res) => {
    const {login, password} = req.body;

    db.getUserAcc({login, password})
        .then(result => res.send(result));
});


app.post('/registration', (req, res) => {
    const {login, password} = req.body;

    db.createUserAcc({login, password})
        .then(
            (result) => {
                console.log(result);
                console.log('\n');
                console.log('============== [ New user registration ] ==============');
                console.log('Successfully');
                console.log(`Login:    ${login}`);
                console.log(`Password: ${password}`);
                console.log('=======================================================');
                return result;
            },
            (reject) => {
                console.log('\n');
                console.log('============== [ New user registration ] ==============');
                console.log('Error: ', reject);
                console.log(`Login:    ${login}`);
                console.log(`Password: ${password}`);
                console.log('=======================================================');
                return {errMessage: reject};
            },
        )
        .then(result => res.send(result));
});


app.post('/addpassword', (req, res) => {
    const {login, passwordItem} = req.body;

    db.addPassword(login, passwordItem)
        .then(data => res.send(true));
});


app.post('/removepassword', (req, res) => {
    const {login, passwordItemIndex} = req.body;

    db.removePassword(login, passwordItemIndex)
        .then(data => res.send(true));
});


app.post('/editpassword', (req, res) => {
    const {login, passwordIndex, passwordItem} = req.body;

    db.editPassword(login, passwordIndex, passwordItem)
        .then(data => res.send(true));
});


app.post('/admin_panel', (req, res) => {
    console.dir('-----------------/admin_panel/-------------------');

    db.getModel3DList()
        .then(result => res.send(result) );
});


app.post('/getModel', (req, res) => {
    console.dir('-----------------/:model3DId/-------------------' + req.body.modelId);

    db.getModel3D( req.body.modelId )
        .then(result => res.send(result));


});


app.get('/getModel3DList', (req, res) => {
    console.dir('-----------------/getModel3DList/-------------------');

    db.getModel3DList()
        .then(result => res.send(result) );
});


app.post('/removeModel', (req, res) => {
    console.dir('-----------------/removeModel/-------------------');


    db.getModel3D( req.body.modelId )
        .then(result => {

            fs.unlink( path.resolve(path.dirname('') + ServerConfig.model3DStore + result.url), ()=>{} );
            fs.unlink( path.resolve(path.dirname('') + ServerConfig.model3DStore + result._id+'.jpeg'), ()=>{} );

            db.deleteModel3D( req.body.modelId )
                .then(result => {
                    console.dir("DELETED MODEL: " + req.body.modelId);
                    res.send(result)
                });

        });
});



app.post('/uploadModel', (req, res) => {
    console.dir('-----------------/uploadModel/-------------------' + req.body.modelName);

    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const modelData = JSON.parse(req.body.model);
    const model3DFile = req.files.file;
    const modelPreview = req.body.filePreview.replace(/^data:image\/jpeg;base64,/, "");

    db.createModel3D({
        name: modelData.name,
        url:  modelData.name+'.json',
        tags: modelData.tags
    })
        .then( (result)=>{
            const modelUrl = result._id+'.json';

            model3DFile.mv( path.resolve(path.dirname('') + ServerConfig.model3DStore + modelUrl), function(err) {
                if(err)  return res.status(500).send(err);
            });

            fs.writeFile(path.resolve(path.dirname('') + ServerConfig.model3DStore + result._id+'.jpeg'), modelPreview, 'base64', (err)=>{console.log(err)});

            // return db.getModel3DList()

            const newModelData = result;
            newModelData.url = modelUrl;

            return db.editModel3D( newModelData );
        })
        .then( result => res.send(result) );
});


app.post('/saveModel', (req, res) => {
    console.dir('-----------------/saveModel/-------------------');

    if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }


    const model3DFile = req.files.file;
    const modelData = JSON.parse(req.body.model);
    const modelPreview = req.body.filePreview.replace(/^data:image\/jpeg;base64,/, "");

    db.editModel3D( modelData );

    fs.writeFile(path.resolve(path.dirname('') + ServerConfig.model3DStore + modelData._id + '.jpeg'), modelPreview, 'base64', (err)=>{console.log(err)});

    model3DFile.mv( path.resolve(path.dirname('') + ServerConfig.model3DStore + modelData.url), function(err) {
        if(err)  return res.status(500).send(err);

        return res.status(200).send("Model saved");
    });
});



app.listen(ServerConfig.serverPort, () => {
    console.log(`app listening on port ${ServerConfig.serverPort}!`);
});
