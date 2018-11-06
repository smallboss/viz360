import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

import * as Utils from '../assets/js/utils';

import ServerConfig from '../../config/config.json';

import ModelList from './ModelList';
import ModelEditor from './ModelEditor';
import ModelViewer from './ModelViewer';

import * as THREE from 'three-full';

import store from '../redux/store';

window.THREE = THREE;

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            modelList: [],
            // isAdmin: location.search.indexOf('?model')!=0 ? true : false,
        };
    }


    render() {

        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <div id="preloader" className="wrap-reloader hide">
                            <img id="preloader-bg" className="preloader-bg" src="" alt=""/>
                            <div className="holder">
                                <div className="circle-stripes-preloader">
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                    <div></div>
                                </div>
                            </div>
                        </div>

                        <Switch>
                            <Route exact path={`${Utils.getPrefixLink()}/admin_panel`} component={ModelList}/>
                            <Route path={`${Utils.getPrefixLink()}/admin_panel/:id`} component={ModelEditor}/>
                            <Route path={`${Utils.getPrefixLink()}/:id`} component={ModelViewer}/>
                        </Switch>
                    </div>
                </Router>
            </Provider>
        )
    }
}


export default App;