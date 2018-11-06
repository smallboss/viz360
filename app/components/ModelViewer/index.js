import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import Viewer from '../viewer/index';

import ServerConfig from '../../../config/config.json';

import ActionTypes from '../../redux/constants/actionTypes';
import {withStyles} from "@material-ui/core/styles/index";


const styles = theme => ({
    chip: {
        margin: 4,
        padding: '5px 0',
        height: 'auto'
    },
});



class ModelViewer extends React.Component {
    constructor(props) {
        super(props);

        this.model = {};
        this.state = {
            isLoaded: false
        };

        this.loaderObject = new THREE.ObjectLoader();

        this.getCurrModel();
        this.handleCanvasContainer = node => this.canvasContainer = node;
    }


    getCurrModel() {
        const posLastSlash = location.pathname.lastIndexOf('/');
        const modelId = location.pathname.substring(posLastSlash + 1);

        if (!this.props.currModel.url) this.props.initCurrModel(modelId);
        else this.loadModel(this.props.currModel.url, true);
    }


    loadModel(modelUrl) {

        const previewImg = `${ServerConfig.apiPrefix + ':' + ServerConfig.serverPort + ServerConfig.model3DStore + this.props.currModel._id}/preview.jpeg`;
        document.getElementById('preloader').classList.remove('hide');
        document.getElementById('preloader').style['background-image'] = `url(${previewImg})`;

        const modelDownloadUrl = ServerConfig.apiPrefix + ':' + ServerConfig.serverPort + ServerConfig.model3DStore + this.props.currModel._id + '/model.json';

        this.loaderObject.load(modelDownloadUrl, (model) => {
                this.model = model;
                Viewer.addModelToScene(this.model, 'viewer');
                document.getElementById('preloader').classList.add('hide');
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded')
            },
            (err) => {
                console.log('An error happened ', err)
            }
        );
    }


    componentDidMount() {
        Viewer.attach(this.canvasContainer);
    }

    componentDidUpdate(nextProps) {
        if(!this.state.isLoaded) {
            this.loadModel(this.props.currModel.url);
            this.setState({ isLoaded: true });
        }
    }

    componentWillUnmount() {
        this.props.clearCurrModel();
        Viewer.detach(this.canvasContainer)
    }

    render() {
        const {classes} = this.props;

        return (
            <section className="wrap-editor">
                <div ref={this.handleCanvasContainer} className="wrap-viewer"></div>
            </section>
        )
    }
}


export default compose(
    connect(
        state => ({
            currModel: state.currModel,
        }),
        dispatch => ({
            initCurrModel: (modelId) => {

                const myInit = {
                    method: 'POST',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    body: JSON.stringify({"modelId": modelId}),
                };

                fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/getModel/`, myInit)
                    .then((res) => {
                        if (res.status == 200) return res.json();
                    })
                    .then((currModel) => {
                        dispatch({type: ActionTypes.INIT_CURR_MODEL, payload: currModel});
                    })
                    .catch((reject) => {
                        console.log('reject', reject);
                    });
            },

            clearCurrModel: () => {
                dispatch({type: ActionTypes.CLEAR_CURR_MODEL});
            },
        })
    ),
    withStyles(styles)
)(ModelViewer);