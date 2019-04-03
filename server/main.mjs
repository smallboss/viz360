import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';

import ServerConfig from '../config/config.json';
import * as db from './utils/DBUtils';

const __dirname = path.resolve(path.dirname('') + '/server');

db.setUpConnection();

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors({origin: '*'}));
app.use(ServerConfig.model3DStore, express.static( path.resolve(path.dirname('') + ServerConfig.model3DStore) ));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

app.use(express.static(__dirname + '/front'));

const modelStorePath = path.dirname('')+ServerConfig.model3DStore;

// db.removeAllUsers();
// db.createModel3D({
//     name: 'FUR_Sofa002',
//     url:  'FUR_Sofa002.FBX',
//     tags: ['sofa', 'red', 'tag 3']
// });


// app.post('/admin_panel', (req, res) => {
//     console.dir('-----------------/admin_panel get/-------------------');
//
//     db.getModel3DList()
//         .then(result => res.send(result));
// });

app.post('/admin_panel', (req, res) => {
    console.dir('-----------------/admin_panel post/-------------------');

    db.getModel3DList()
        .then(result => res.send(result));
});
//
// app.use('/admin_panel', (req, res) => {
//     console.dir('-----------------/admin_panel use/-------------------');
//
//     db.getModel3DList()
//         .then(result => res.send(result));
// });


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

    const removeModelId = req.body.modelId;
    const modelDir = modelStorePath + '/' + removeModelId + '/';

    fs.remove(modelDir, ()=>{});

    db.deleteModel3D( removeModelId )
        .then(result => {
            console.dir("DELETED MODEL: " + req.body.modelId);
            res.send(result)
        });
});



app.post('/uploadModel', (req, res) => {
    console.dir('-----------------/uploadModel/-------------------' + JSON.parse(req.body.model).name);

    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const modelData = JSON.parse(req.body.model);
    const model3DFile = req.files.file;
    // const modelPreview = req.body.filePreview.replace(/^data:image\/jpeg;base64,/, "");
    // const modelDir = modelStorePath + '/' + modelData._id;

    db.createModel3D({
        name: modelData.name,
        tags: modelData.tags
    })
        .then( (result)=>{
            const modelDir = modelStorePath + '/' + result._id + '/';

            fs.mkdirSync(modelDir);

            if( req.body.filePreview ) {
                const modelPreview = req.body.filePreview.replace(/^data:image\/jpeg;base64,/, "");
                fs.writeFile(path.resolve(modelDir + 'preview.jpeg'), modelPreview, 'base64', (err)=>{console.log(err)});
            }

            model3DFile.mv( path.resolve(modelDir + 'model.json'), function(err) {
                if(err)  return res.status(500).send(err);

                res.status(200).send( result );
            });

            // let modelFile = '';

            // for (let fileName in req.files){
            //     const file = req.files[fileName];
            //
            //     let saveFileName = fileName;
            //     if(fileName.toLowerCase().includes('.fbx')) { saveFileName = 'model.fbx'; modelFile = saveFileName; }
            //     if(fileName.toLowerCase().includes('.obj')) { saveFileName = 'model.obj'; modelFile = saveFileName; }
            //     if(fileName.toLowerCase().includes('.mtl'))   saveFileName = 'materials.mtl';
            //
            //     file.mv( path.resolve(modelDir + saveFileName), function(err) {
            //         if(err)  return res.status(500).send(err);
            //     });
            // }

            // const resNoJSONModel = { ...result };

            // res.status(200).send( result );
        });
});


app.post('/saveModel', (req, res) => {
    console.dir('-----------------/saveModel/-------------------');

    if (Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const model3DFile = req.files.file;
    const modelData = JSON.parse(req.body.model);
    const modelDir = modelStorePath + '/' + modelData._id + '/';
    let modelPreview = '';
    if( req.body.filePreview ) {
        modelPreview = req.body.filePreview.replace(/^data:image\/jpeg;base64,/, "");
        fs.writeFile(path.resolve(modelDir + 'preview.jpeg'), modelPreview, 'base64', (err)=>{console.log(err)});
    }

    db.editModel3D( modelData );

    // let i=0;
    // while(req.files['img_'+i]){
    //     const currImg = req.files['img_'+i];
    //     currImg.mv( path.resolve(modelDir + currImg.name), ()=>{});
    //     i++;
    // }

    model3DFile.mv( path.resolve(modelDir + 'model.json'), function(err) {
        if(err)  return res.status(500).send(err);

        return res.status(200).send({msg: "Model saved"});
    });
});

app.get('*', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization");

    res.contentType("text/html; charset=utf-8");

    res.sendFile(path.join(__dirname+'/front/index.html'));

});

app.listen(ServerConfig.serverPort, () => {
    console.log(`app listening on port ${ServerConfig.serverPort}!`);
});
