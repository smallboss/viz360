import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
// import 'three/examples/js/loaders/TGALoader';
// import 'three/examples/js/loaders/FBXLoader';
// import 'three/examples/js/loaders/DDSLoader';
// import 'three/examples/js/loaders/MTLLoader';
// import 'three/examples/js/loaders/OBJLoader';
// import 'three/examples/js/controls/OrbitControls';
// import 'three/examples/js/controls/TransformControls';

import * as Utils from '../assets/js/utils';

import ServerConfig from '../../config/config.json';

import ModelList from './ModelList';
import ModelEditor from './ModelEditor';

import store from '../redux/store';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modelList: [],
            // isAdmin: location.search.indexOf('?model')!=0 ? true : false,
            // currModel3DId: Utils.parseQueryString(location.search).modelid,
        };

        console.log('Utils.parseQueryString(location.pathname).model3DId', Utils.parseQueryString(location.search).modelid);

        // this.initScene();
    }



    componentDidMount() {

        // const myInit = {
        //     method: 'GET',
        //     headers: {
        //         'Access-Control-Allow-Origin': '*',
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        //     // mode: 'cors',
        //     cache: 'default',
        // };
        //
        // fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/getModel3DList/`, myInit)
        //     .then((res) => {
        //         if(res.status == 200)  return res.json();
        //     })
        //     .then((data) => {
        //         console.log('modelList: ', data);
        //
        //         // if(!this.state.isAdmin){
        //         //     const currModel3D = data.filter( model3d => model3d._id == this.state.currModel3DId )[0];
        //         //     this.onEditModel( currModel3D.url );
        //         // }
        //
        //         this.setState({ modelList: data });
        //     })
        //     .catch((reject) => {
        //         console.log('reject', reject);
        //     });
    }



    // onDeleteModel( modelId ) {
    //     const myInit = {
    //         method: 'POST',
    //         headers: {
    //             'Access-Control-Allow-Origin': '*',
    //             'Accept': 'application/json',
    //             'Content-Type': 'application/json',
    //         },
    //         mode: 'cors',
    //         body: JSON.stringify({ "modelId": modelId }),
    //     };
    //
    //     fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/removeModel/`, myInit)
    //         .then((res) => {
    //             if(res.status == 200)  return res.json();
    //         })
    //         .then((data) => {
    //             this.setState({ modelList: this.state.modelList.filter( el => el._id != modelId ) });
    //         })
    //         .catch((reject)=>{ console.log('reject', reject) });
    // }



    uploadModel(event) {
        event.preventDefault();

        console.log('this.fileNewModal3D.files[0]', this.fileNewModal3D.files[0]);

        const formUploadModel3D = event.target;

        let formData = new FormData();
        formData.append('file', this.fileNewModal3D.files[0]);

        fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/uploadModel/`, {
            method: 'POST',
            contentType: false,
            body: formData // This is your file object
        }).then(
            response => response.json() // if the response is a JSON object
        ).then(
            (data) => {
                this.onEditModel( this.fileNewModal3D.files[0].name );

                this.setState({ modelList: data });
                formUploadModel3D.reset();
            }
        ).catch(
            error => console.log(error) // Handle the error response object
        );
    }


    onCopyLink( modelId ) {
        const model3DLink = `${location.origin}/?modelid=${modelId}`;
        console.log('Copy Link: ', model3DLink);

        Utils.copyToClipboard( model3DLink );
    }


    render() {
        return (
            <Provider store={store}>
                <Router>
                    <Switch>
                        <Route exact path='/admin_panel' component={ModelList}/>
                        <Route path='/:id' component={ModelEditor}/>
                    </Switch>
                </Router>
            </Provider>
        )
    }
}


export default App;