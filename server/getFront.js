// const express = require('express');
// const app = express();
// const path = require('path');
// const router = express.Router();
//
// const port = 3110;
//
// // router.get('/',function(req,res){
// //     //__dirname : It will resolve to your project folder.
// // });
//
// //add the router
// // app.use('/', router);
// app.use(express.static(__dirname + '/front'));
// app.use('*', function (req, res) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization");
//
//     res.contentType("text/html; charset=utf-8");
//
//     res.sendFile(path.join(__dirname+'/front/index.html'));
//
// });
// // app.use(express.static(__dirname + '/styles'));
// // app.use(express.static(__dirname + '/vendors'));
// app.listen(process.env.port || port);

console.log(__dirname + 'Running at Port ');