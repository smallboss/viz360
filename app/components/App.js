import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';

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
        };
    }


    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <div id="preloader" className="wrap-reloader hide">
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
                            <Route path={`${Utils.getPrefixLink()}/:id`} component={ModelEditor}/>
                        </Switch>
                    </div>
                </Router>
            </Provider>
        )
    }
}


export default App;