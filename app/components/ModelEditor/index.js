import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import classNames from 'classnames';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/lab/Slider';
import ArrowbackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';


import Viewer from './viewer/index';

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


class MegaSlider extends React.Component {
    render() {
        return (
            <div className="setng-row">
                <span className="stngs-name">{`${this.props.valName}:`}</span>
                <Slider
                    value={this.props.el[this.props.valName]}
                    min={this.props.min}
                    max={this.props.max}
                    onChange={(event, value) => {
                        this.props.el[this.props.valName] = value;
                        this.forceUpdate();
                    }}
                />
            </div>
        )
    }
}




class ModelEditor extends React.Component {
    constructor(props) {
        super(props);

        this.model = {};

        this.state = {
            lightObjects: [],
            meshObjects: [],
            showAppMesg: false
        };

        this.loaderFBX = new THREE.FBXLoader();
        this.loaderOBJ = new THREE.OBJLoader();
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


    loadModel(modelUrl, isLolModel) {

        if(!isLolModel) document.getElementById('preloader').classList.remove('hide');

        const modelDownloadUrl = (!isLolModel ? ServerConfig.apiPrefix + ':' + ServerConfig.serverPort + ServerConfig.model3DStore : '') + modelUrl;

        this.loaderObject.load(modelDownloadUrl, (model) => {
                this.model = model;
                console.log('LOADED MODEL: ', this.model);
                Viewer.addModelToScene(this.model);

                const lightObjects = [];
                const meshObjects = [];

                this.model.traverse(el => {
                    if(el.type.includes('Light')) lightObjects.push(el);
                    else if(el.type.includes('Mesh')) meshObjects.push(el)
                });


                this.model.traverse(el => {
                    if(el.type.includes('PointLight'))  Viewer.addLightHelper( el );
                });


                this.setState({
                    lightObjects: lightObjects,
                    meshObjects: meshObjects
                });

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


    initStgsPanel(model) {
        model.traverse(el => {
            console.log('el: ', el);
        })
    }


    renderStgsItem(el) {
        console.log('EL', el);

        const getColor = (el, valName) => {
            return (
                <div className="setng-row">
                    <span className="stngs-name">{`${valName}:`}</span>
                    <input
                        type="color"
                        value={`#${el[valName].getHexString()}`}
                        onChange={(event)=>{ el[valName].setStyle( event.target.value ); this.forceUpdate(); }} />
                </div>
            )
        };

        const getSlider = (el, valName, min, max) => {
            return <MegaSlider el={el} valName={valName} min={min} max={max} />
        };

        const getTexture = (el, valName) => {

            const materialMap =  el.material ? el.material : el;

            const bgTexture = {};
            if(materialMap[valName] && materialMap[valName].image)
                bgTexture.backgroundImage = `url(${materialMap[valName].image.src})`;


            return (
                <div className="setng-row">
                    <span className="stngs-name">{`${valName}:`}</span>

                    <div className="texture-preview" style={ bgTexture }>
                        <input type="file" onChange={(event)=>{

                            const textureInput = event.target;

                            console.log('event.target', event.target);

                            const reader = new FileReader();
                            reader.onload = (e) => {
                                console.log('event.target', textureInput);
                                const image = new Image();
                                image.src = e.target.result;
                                const texture = new THREE.Texture();
                                texture.image = image;
                                texture.minFilter = THREE.LinearFilter;
                                texture.magFilter = THREE.LinearFilter;
                                materialMap[valName] = texture;
                                image.onload = function() {
                                    texture.needsUpdate = true;
                                    console.log('event.target', textureInput);
                                    materialMap.needsUpdate = true;

                                    textureInput.parentElement.style['background-image'] = `url(${e.target.result})`;
                                };
                                // texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
                            };

                            reader.readAsDataURL(event.target.files[0]);
                        }}/>
                    </div>
                </div>
            )
        };


        if(el.type.includes('Light')) {
            return (
                <div key={el.uuid} className="wrap-stgs-item">
                    {/*<span>{el.type} <input type="checkbox" value={el.visibility} onChange={()=>{el.visibility=!el.visibility; this.forceUpdate()}} /></span>*/}
                    <div className="wrap-stng-row">
                        <span className="stngs-name">{el.type}</span>
                        { el.type.includes('PointLight')
                            ? <CloseIcon onClick={()=>this.removeLight(el)}/ >
                            : ''
                        }
                    </div>
                    {getColor(el, 'color')}
                    {getSlider(el, 'intensity', 0.001, 5)}
                    { el.distance ? getSlider(el, 'distance', 0, 1000) : ''}
                </div>
            )
        }
        else if(el.type.includes('Mesh')) {

            if(el.material.length){
                const materialStgsArray = [];
                materialStgsArray.push(el.material.map(el=>(
                    <div key={el.uuid} className="wrap-stgs-item">
                        <div className="wrap-stng-row">
                            <span className="stngs-name">{el.type}</span>
                        </div>
                        {getColor(el, 'color')}
                        {getColor(el, 'emissive')}
                        {getColor(el, 'specular')}
                        {getSlider(el, 'shininess', 0, 100)}
                        {getTexture(el, 'map')}
                    </div>
                )))

                return materialStgsArray;
            }

            return (
                <div key={el.material.uuid} className="wrap-stgs-item">
                    <div className="wrap-stng-row">
                        <span className="stngs-name">{el.material.type}</span>
                    </div>
                    {getColor(el.material, 'color')}
                    {getColor(el.material, 'emissive')}
                    {getColor(el.material, 'specular')}
                    {getSlider(el.material, 'shininess', 0, 100)}
                    {getTexture(el, 'map')}
                </div>
            )
        }
        else return '';
    }


    removeLight( light ) {
        const newLightObjects = this.state.lightObjects.filter( el => el.uuid != light.uuid );
        Viewer.removeLight( light );
        this.setState({ lightObjects: newLightObjects });
    }


    componentDidMount() {
        Viewer.attach(this.canvasContainer);
    }

    componentDidUpdate(nextProps) {
        if (!this.state.lightObjects.length) this.loadModel(this.props.currModel.url, this.props.currModel.url.includes('blob'));
    }

    componentWillUnmount() {
        this.props.clearCurrModel();
        Viewer.detach(this.canvasContainer)
    }


    saveModel() {

        document.getElementById('preloader').classList.remove('hide');

        const json = JSON.stringify( this.model );
        const blob = new Blob([json], {type: "octet/stream"});

        const formData = new FormData();
        formData.append('modelName', this.props.currModel.name);
        formData.append('file', blob);


        fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/saveModel/`, {
            method: 'POST',
            contentType: false,
            body: formData,
        })
            .then((res) => {
                if(res.status == 200)  this.setState({ showAppMesg: true });

                document.getElementById('preloader').classList.add('hide');
            })
            .catch(
                error => console.log(error) // Handle the error response object
            );
    }


    addPonterLight() {
        const pointLight = new THREE.PointLight(0xff5555, 1.7, 800);
        pointLight.name = 'PointLight';
        pointLight.position.set(0, 180, 0);

        this.model.add( pointLight );
        Viewer.addLightHelper( pointLight );

        this.setState({ lightObjects: [...this.state.lightObjects, pointLight] });
    }


    render() {
        const {classes} = this.props;

        return (
            <section className="wrap-editor">
                <Card className="settings-panel">
                    <CardContent>
                        <div className="wrap-settings-top-btn">
                            <Link to="/admin_panel">
                                <Button variant="contained">
                                    <ArrowbackIcon style={{marginRight: 5}}/>
                                    Admin panel
                                </Button>
                            </Link>

                            <Button variant="contained" color="primary" onClick={()=>this.saveModel()}>
                                Save
                                <SaveIcon style={{marginLeft: 5}}/>
                            </Button>

                            <Snackbar
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                open={this.state.showAppMesg}
                                autoHideDuration={4000}
                                onClose={()=>this.setState({ showAppMesg: false })}
                                message={<span>Model saved</span>}
                            />
                        </div>

                        <div className="wrap-settings">
                            <h3>{this.props.currModel.name}</h3>

                            <div className="wrap-settings-model-tags">
                                <Chip
                                    label="Selected Tag 2"
                                    className={classNames(classes.chip, "model-tag selected")}
                                    color="primary"
                                    onClick={() => {
                                    }}
                                />
                                <Chip
                                    label="Selected Tag 2"
                                    className={classNames(classes.chip, "model-tag selected")}
                                    color="primary"
                                    onClick={() => {
                                    }}
                                />
                            </div>

                            <div className="wrap-stgs-controls">
                                {
                                    (this.state.lightObjects.length)
                                        ? this.state.lightObjects.map(el => this.renderStgsItem(el))
                                        : ''
                                }

                                <div className="wrap-stgs-item">
                                    <Button variant="contained" color="primary" onClick={()=>this.addPonterLight()}>
                                        Add PointerLight
                                    </Button>
                                </div>

                                {
                                    (this.state.meshObjects.length)
                                        ? this.state.meshObjects.map(el => this.renderStgsItem(el))
                                        : ''
                                }
                            </div>
                        </div>


                    </CardContent>
                </Card>


                <Card>
                    <div ref={this.handleCanvasContainer} className="wrap-viewer"></div>
                </Card>
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
                        console.log('currModel: ', currModel);

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
)(ModelEditor);