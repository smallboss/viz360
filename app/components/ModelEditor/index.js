import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import { saveAs } from 'file-saver';

import classNames from 'classnames';

import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Snackbar from '@material-ui/core/Snackbar';
import Slider from '@material-ui/lab/Slider';
import ArrowbackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';


import Viewer from '../viewer/index';

import ServerConfig from '../../../config/config.json';

import ActionTypes from '../../redux/constants/actionTypes';
import {withStyles} from "@material-ui/core/styles/index";


const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    chip: {
        margin: 4,
        padding: '5px 0',
        height: 'auto'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    modelName: {
        marginTop: 0,
        marginBottom: 10,
    },
    w100p: {
        marginLeft: 0,
        marginRight: 0,
        width: '100%'
    },
    uploadModalTitle: {
        paddingBottom: 15,
    },
    btnUploadModel: {
        margin: '20px auto -7px',
        display: 'flex',
    }
});


class MegaSlider extends React.Component {
    render() {
        const { el, valName, min, max } = this.props;
        const value = el[valName] ? el[valName] : 0;

        return (
            <div className="setng-row">
                <span className="stngs-name">{`${valName}:`}</span>
                <Slider
                    value={value}
                    min={min}
                    max={max}
                    onChange={(event, value) => {
                        const diffFOV = el[valName] / value;
                        el[valName] = value;
                        this.forceUpdate();

                        if(valName === 'fov') {
                            el.position.multiplyScalar(diffFOV);
                            el.updateProjectionMatrix();
                            Viewer.scaleTransformControls();
                        }
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
            showAppMesg: false,
            newTagCurrModel: '',
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
        else this.loadModel(this.props.currModel.url);
    }


    loadModel(locModelUrl) {

        if (!locModelUrl) {
            let previewImg = `${ServerConfig.apiPrefix + ':' + ServerConfig.serverPort + ServerConfig.model3DStore + this.props.currModel._id}/preview.jpeg`;
            const modelIdFromUrl = location.pathname.substr(location.pathname.lastIndexOf('/')+1);

            fetch( previewImg, {cache: 'no-cache'} );
            document.getElementById('preloader').classList.remove('hide');
            document.getElementById('preloader').style['background-image'] = `url(${previewImg})`;
            document.getElementById('preloader-bg').src = previewImg;
        }

        const modelDownloadUrl = !locModelUrl
                                    ? ServerConfig.apiPrefix + ':' + ServerConfig.serverPort + ServerConfig.model3DStore + this.props.currModel._id + '/model.json'
                                    : locModelUrl;


        const setPath = ServerConfig.apiPrefix + ':' + ServerConfig.serverPort + ServerConfig.model3DStore + '/' + location.pathname.substr(location.pathname.lastIndexOf('/')+1) + '/';


        this.loaderObject.load(modelDownloadUrl, (model) => {

                this.model = model;
                Viewer.addModelToScene(this.model);

                const lightObjects = [];
                const meshObjects = [];

                this.model.traverse(el => {
                    if (el.type.includes('Light')) lightObjects.push(el);
                    else if (el.type.includes('Mesh')) {
                        // el.material = new THREE.MeshStandardMaterial();
                        meshObjects.push(el);
                    }

                    if (el.type.includes('PointLight')) Viewer.addLightHelper(el);
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



        // THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
        // new THREE.MTLLoader()
        //     .setPath( setPath )
        //     .load( 'male02_dds.mtl', ( materials ) => {
        //         materials.preload();
        //         new THREE.OBJLoader()
        //             .setMaterials( materials )
        //             .setPath( setPath )
        //             .load( 'male02.obj', ( model ) => {
        //                 this.model = model;
        //                 console.log('LOADED MODEL: ', this.model);
        //                 Viewer.addModelToScene(this.model);
        //
        //                 document.getElementById('preloader').classList.add('hide');
        //
        //                 const lightObjects = [];
        //                 const meshObjects = [];
        //
        //                 this.model.traverse(el => {
        //                     if (el.type.includes('Light')) lightObjects.push(el);
        //                     else if (el.type.includes('Mesh')) meshObjects.push(el)
        //                 });
        //
        //                 this.model.traverse(el => {
        //                     if (el.type.includes('PointLight')) Viewer.addLightHelper(el);
        //                 });
        //
        //                 // this.setState({
        //                 //     lightObjects: lightObjects,
        //                 //     meshObjects: meshObjects
        //                 // });
        //             }, ()=>{}, err=>{console.log('ERROR: ', err)} );
        //     } );
    }


    removeTexture( event, materialMap, valName, elPreviewInput ) {
        console.log('event.target', event.target);
        event.target.previousSibling.children[0].value = '';
        event.target.previousSibling.children[0].type = '';
        event.target.previousSibling.children[0].type = 'file';

        if(materialMap[valName]) materialMap[valName].dispose();
        materialMap[valName] = null;
        materialMap.needsUpdate = true;
        elPreviewInput.style['background-image'] = '';
        document.getElementById('preloader-bg').src = '';
    }

    loadTexture( event, materialMap, valName ) {
        const textureInput = event.target;
        const reader = new FileReader();


        if(valName == 'envMap') {
            const loader = new THREE.CubeTextureLoader();
            const imgArray = [];

            for (let file of event.target.files) {
                imgArray.push( window.URL.createObjectURL(new Blob([file], {type: "octet/stream"})) );
            }

            const envMap = new THREE.TextureLoader().load( imgArray[0] );
            envMap.mapping = THREE.SphericalReflectionMapping;

            // new THREE.TextureLoader().load( imgArray[0], ( texture ) => {
            //     texture.encoding = THREE.sRGBEncoding;
            //     const cubemapGenerator = new THREE.EquirectangularToCubeGenerator( texture, { resolution: 512 } );
            //     // pngBackground = cubemapGenerator.renderTarget;
            //     const cubeMapTexture = cubemapGenerator.update( Viewer.renderer );
            //     const pmremGenerator = new THREE.PMREMGenerator( cubeMapTexture );
            //     pmremGenerator.update( Viewer.renderer );
            //     const pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
            //     pmremCubeUVPacker.update( Viewer.renderer );
            //     const pngCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
            //     materialMap[valName] = pngCubeRenderTarget.texture;
            //     materialMap[valName].needsUpdate = true;
            //     materialMap.needsUpdate = true;
            //     // texture.dispose();
            //     // pmremGenerator.dispose();
            //     // pmremCubeUVPacker.dispose();
            // });

            materialMap[valName] = envMap;
            materialMap[valName].needsUpdate = true;
            materialMap.needsUpdate = true;
            textureInput.parentElement.style['background-image'] = `url(${imgArray[0]})`;
        }
        else{
            reader.onload = (e) => {
                const image = new Image();
                image.src = e.target.result;
                const texture = new THREE.Texture();
                texture.image = image;
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                if(materialMap[valName]) materialMap[valName].dispose();
                materialMap[valName] = texture;
                image.onload = function () {
                    texture.needsUpdate = true;
                    materialMap.needsUpdate = true;

                    textureInput.parentElement.style['background-image'] = `url(${e.target.result})`;
                };
                // texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            };

            console.log('event.target.files[0]', event.target.files[0]);

            if(event.target.files[0])  reader.readAsDataURL(event.target.files[0]);
        }
    }

    renderStgsItem(el) {

        const getColor = (el, valName) => {
            return (
                <div className="setng-row">
                    <span className="stngs-name">{`${valName}:`}</span>
                    <input
                        type="color"
                        value={`#${el[valName].getHexString()}`}
                        onChange={(event) => {
                            el[valName].setStyle(event.target.value);
                            this.forceUpdate();
                        }}/>
                </div>
            )
        };

        const getSlider = (el, valName, min, max) => {
            return <MegaSlider el={el} valName={valName} min={min} max={max}/>
        };

        const getTexture = (el, valName) => {

            const materialMap = el.material ? el.material : el;

            const bgTexture = {};
            if(materialMap[valName] && materialMap[valName].image){
                const imgSrc = materialMap[valName].image.length ? materialMap[valName].image[0].src : materialMap[valName].image.src;
                bgTexture.backgroundImage = `url(${imgSrc})`;
            }


            let elPreviewInput = null;

            return (
                <div className="setng-row">
                    <span className="stngs-name">{`${valName}:`}</span>

                    <div className="wrap-texture-stng">
                        <div className="texture-preview" ref={ el=>elPreviewInput=el} style={bgTexture}>
                            <input type="file" onChange={(event) => this.loadTexture(event, materialMap, valName)} multiple />
                        </div>
                        <Button className="btn-remove-texture small" variant="contained" color="primary" onClick={(event)=>this.removeTexture( event, materialMap, valName, elPreviewInput )}>
                            Del
                        </Button>
                    </div>
                </div>
            )
        };

        if (el.type.includes('Scene')) {
            return (
                <div key={el.uuid} className="wrap-stgs-item">
                    {getColor(el, 'background')}
                </div>
            )
        }

        if (el.type.includes('Camera')) {
            return (
                <div key={el.uuid} className="wrap-stgs-item">
                    {getSlider(el, 'fov', 10, 100)}
                </div>
            )
        }

        if (el.type.includes('Light')) {
            return (
                <div key={el.uuid} className="wrap-stgs-item">
                    {/*<span>{el.type} <input type="checkbox" value={el.visibility} onChange={()=>{el.visibility=!el.visibility; this.forceUpdate()}} /></span>*/}
                    <div className="wrap-stng-row">
                        <span className="stngs-name" onClick={()=>Viewer.transformControlsAttach(el)}>{el.type}</span>
                        {el.type.includes('PointLight')
                            ? <CloseIcon onClick={()=>this.removeLight(el)} />
                            : ''
                        }
                    </div>
                    {getColor(el, 'color')}
                    {getSlider(el, 'intensity', 0.001, 5)}
                    {el.distance ? getSlider(el, 'distance', 0, 800) : ''}
                </div>
            )
        }
        else if (el.type.includes('Mesh')) {

            if (el.material.length) {
                const materialStgsArray = [];
                materialStgsArray.push(el.material.map(el => (
                    <div key={el.uuid} className="wrap-stgs-item">
                        <div className="wrap-stng-row">
                            <span className="stngs-name">{el.type}</span>
                        </div>
                        {getColor(el, 'color')}
                        {getColor(el, 'emissive')}
                        {getColor(el, 'specular')}
                        {getSlider(el, 'shininess', 0, 100)}
                        {getTexture(el, 'map')}
                        {getTexture(el, 'specularMap')}
                        {getTexture(el, 'normalMap')}
                        {getTexture(el, 'envMap')}
                        {getSlider(el, 'reflectivity', 0, 1)}
                        {getTexture(el, 'aoMap')}
                        {getSlider(el, 'aoMapIntensity', 0, 1)}
                    </div>
                )));

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
                    {getTexture(el.material, 'map')}
                    {getTexture(el.material, 'specularMap')}
                    {getTexture(el.material, 'normalMap')}
                    {getTexture(el.material, 'envMap')}
                    {getSlider(el.material, 'reflectivity', 0, 1)}
                    {getTexture(el.material, 'aoMap')}
                    {getSlider(el.material, 'aoMapIntensity', 0, 1)}
                </div>
            )
        }
        else return '';
    }


    removeLight(light) {
        const newLightObjects = this.state.lightObjects.filter(el => el.uuid != light.uuid);
        Viewer.removeLight(light);
        this.setState({lightObjects: newLightObjects});
    }


    componentDidMount() {
        Viewer.attach(this.canvasContainer);
    }

    componentDidUpdate(nextProps) {
        if (!this.state.lightObjects.length) {
            const loadModelUrl = this.props.currModel.url ? this.props.currModel.url : null;
            this.loadModel(loadModelUrl);
        }
    }

    componentWillUnmount() {
        this.props.clearCurrModel();
        Viewer.detach(this.canvasContainer);

        document.getElementById('preloader').style['background-image'] = '';
        document.getElementById('preloader-bg').src = '';
    }


    saveModel() {

        Viewer.hideHelpElements();

        setTimeout(()=>{

            this.model.remove( this.model.getObjectByName('PerspectiveCamera') );

            this.model.children.push( Viewer.camera );
            this.model.userData.bg = Viewer.scene.background;
            const modelJSON = this.model.toJSON();
            // modelJSON.cameraPos = Viewer.camera.position.toArray();
            const images = [];

            // modelJSON.images.forEach( img => {
            //     const currImg = new Image();
            //     const imgType = img.url.includes('image/jpeg') ? '.jpeg' : ".png";
            //     currImg.src = img.url;
            //     currImg.name = img.uuid + imgType;
            //     img.url = img.uuid + imgType;
            //
            //     images.push( currImg );
            // });


            const blob = new Blob([JSON.stringify(modelJSON)], {type: "octet/stream"});

            this.canvasContainer.style['background-image'] = `url(${Viewer.getPreviewImg()})`;
            Viewer.renderer.domElement.classList.add('fullscreen');
            Viewer.updateCanvasSizeDimensions();
            Viewer.hideHelpElements();

            const modelPreview = Viewer.getPreviewImg();


            const formData = new FormData();
            formData.append('model', JSON.stringify(this.props.currModel));
            formData.append('file', blob);
            formData.append('filePreview', modelPreview);

            // images.forEach( (img, i) => {
            //     console.log('img', img);
            //     formData.append('img_'+i, new Blob([img.src], {type: "image/jpeg"}));
            // });

            document.getElementById('preloader').classList.remove('hide');
            document.getElementById('preloader').style['background-image'] = `url(${modelPreview})`;
            document.getElementById('preloader-bg').src = modelPreview;


            Viewer.renderer.domElement.classList.remove('fullscreen');
            setTimeout(()=>Viewer.updateCanvasSizeDimensions(), 2);

            const saveModelMethod = !this.props.currModel._id ? 'uploadModel' : 'saveModel';

            fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/${saveModelMethod}`, {
                method: 'POST',
                contentType: false,
                body: formData,
            })
                .then((res) => {
                    if(res.status == 200) {
                        document.getElementById('preloader').classList.add('hide');
                        return res.json();
                    }
                })
                .then( savedCurrModel => {

                    console.log('savedCurrModel', savedCurrModel);

                    if(saveModelMethod == 'uploadModel')  this.props.updateCurrModel(savedCurrModel);

                    this.setState({showAppMesg: true});
                })
                .catch(
                    error => console.log(error) // Handle the error response object
                );
        }, 30);
    }


    addPonterLight() {
        const pointLight = new THREE.PointLight(0xffffff, 1.7, 800);
        pointLight.name = 'PointLight';

        const posPointLight = {
            x: Math.random()*(100+100+1)-100,
            y: 120,
            z: Math.random()*(100+100+1)-100,
        };

        pointLight.position.set(posPointLight.x, posPointLight.y, posPointLight.z);

        this.model.add(pointLight);
        Viewer.addLightHelper(pointLight);

        this.setState({lightObjects: [...this.state.lightObjects, pointLight]});
    }

    addNewTagCurrModel(event) {
        event.preventDefault();

        const newTagInput = event.target.elements['tag'];

        if(this.state.newTagCurrModel) {
            this.props.addModelTag(this.state.newTagCurrModel);
            this.setState({newTagCurrModel: ''});
        }

        newTagInput.focus();
    }


    render() {
        const {classes} = this.props;

        return (
            <section className={`wrap-editor ${ !this.props.currModel.name ? 'hide' : ''}`}>
                <Card className="settings-panel">
                    <CardContent>
                        <div className="wrap-settings-top-btn">
                            <Link to="/admin_panel">
                                <Button variant="contained">
                                    <ArrowbackIcon style={{marginRight: 5}}/>
                                    Admin panel
                                </Button>
                            </Link>

                            <Button variant="contained" color="primary" onClick={() => this.saveModel()}>
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
                                onClose={() => this.setState({showAppMesg: false})}
                                message={<span>Model saved</span>}
                            />
                        </div>

                        <div className="wrap-settings">
                            <div className="wrap-stgs-item">
                                <Button variant="contained" color="primary" onClick={()=>Viewer.resetCameraPos()}> Reset camera </Button>
                            </div>

                            <TextField
                                label="Model name*"
                                className={classNames(classes.textField, classes.modelName, classes.w100p)}
                                name="model-name"
                                margin="dense"
                                value={this.props.currModel.name || ''}
                                onChange={(event) => this.props.setCurrModelName(event.target.value)}/>

                            <div className="wrap-settings-model-tags">
                                {this.props.currModel.tags && this.props.currModel.tags.map((tag, key) => (
                                    <Chip
                                        key={tag + key}
                                        label={tag}
                                        className={classNames(classes.chip, "model-tag selected")}
                                        color="primary"
                                        onDelete={()=>{}}
                                        deleteIcon={<CloseIcon/>}
                                        onClick={()=>this.props.removeModelTag( tag )}
                                    />
                                ))}
                            </div>

                            <form className="add-model-tag" onSubmit={(event) => this.addNewTagCurrModel(event)}>
                                <TextField
                                    label="Enter model tag"
                                    className={classNames(classes.textField, classes.modelName, classes.w100p)}
                                    name="tag"
                                    margin="dense"
                                    value={this.state.newTagCurrModel}
                                    onChange={(event) => this.setState({newTagCurrModel: event.target.value})}/>

                                <Button variant="contained" type="submit" size="small" color="primary" className={classes.button}>Add</Button>
                            </form>

                            <div className="wrap-stgs-controls">
                                { this.renderStgsItem( Viewer.camera ) }

                                { this.renderStgsItem( Viewer.scene ) }

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

                <Card style={{width: '100%'}}>
                    <div ref={this.handleCanvasContainer} className="wrap-viewer"></div>
                </Card>
            </section>
        )
    }
}


export default compose(
    connect(
        state => ({
            modelList: state.modelList,
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

            updateCurrModel: (newDataCurrModel) => {
                dispatch({type: ActionTypes.INIT_CURR_MODEL, payload: newDataCurrModel});
            },

            setCurrModelName: (newCurrModelName) => {
                dispatch({type: ActionTypes.SET_CURR_MODEL_NAME, payload: newCurrModelName});
            },

            addModelTag: (newTag) => {
                dispatch({type: ActionTypes.ADD_TAG_CURR_MODEL, payload: newTag});
            },

            removeModelTag: (removeTag) => {
                dispatch({type: ActionTypes.REMOVE_TAG_CURR_MODEL, payload: removeTag});
            },
        })
    ),
    withStyles(styles)
)(ModelEditor);