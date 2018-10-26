import React from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';
import Dropzone from 'react-dropzone';


import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';


import ServerConfig from '../../../config/config.json';

import ActionTypes from '../../redux/constants/actionTypes';
import * as Utils from "../../assets/js/utils";


const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    leftIcon: {
        marginRight: theme.spacing.unit,
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    iconSmall: {
        fontSize: 20,
    },
    noTextDecor: {
        textDecoration: 'none',
    },
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
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


class ModelList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
            uploadModelName: ''
        };

        this.props.initModelList();

        this.loaderFBX = new THREE.FBXLoader();
        this.loaderOBJ = new THREE.OBJLoader();
    }


    onCopyLink(modelId) {
        const model3DLink = `${location.origin}/${modelId}`;
        console.log('Copy Link: ', model3DLink);

        Utils.copyToClipboard(model3DLink);
    }

    toggleTab( event ) {
        event.target.classList.toggle('selected');
    }


    handleClickOpen() {
        this.setState({ isModalOpen: true });
    };

    handleClose() {
        this.setState({ isModalOpen: false });
    };


    uploadModel() {
        this.converModeltToJSON( this.uploadModelFiles[0].preview, this.uploadModelFiles[0].name, (modelJSON)=>this.uploadModelJSON( modelJSON )  );

        this.props.history.push(`/${this.state.uploadModelName}`);
    }


    uploadModelJSON( modelJSON ) {
        const json = JSON.stringify(modelJSON);
        const blob = new Blob([json], {type: "octet/stream"});

        const formData = new FormData();
        formData.append('modelName', this.state.uploadModelName);
        formData.append('file', blob);

        const newCurrModel = {
            name: this.state.uploadModelName,
            url: window.URL.createObjectURL(blob),
            tags: 'sofa'
        };

        this.props.initCurrModel( newCurrModel );


        fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/uploadModel`, {
            method: 'POST',
            contentType: false,
            body: formData,
        })
            .then((res) => {
                if (res.status == 200) return res.json();
            })
            .then((data) => {
            })
            .catch(
                error => console.log(error) // Handle the error response object
            );
    }


    converModeltToJSON( modelUrl, fileModelName, callback ) {

        if (fileModelName.toLowerCase().includes('.obj')) {
            this.loaderOBJ.load(modelUrl, (model) => {

                this.firstTuningModel( model );
                callback( model );

            }, (progress) => {
                console.log('progress', progress);
            }, (error) => {
                console.log('error', error);
            });
        }
        else {
            this.loaderFBX.load(modelUrl, (model) => {

                this.firstTuningModel( model );
                callback( model.toJSON() );

            }, (progress) => {
                console.log('progress', progress);
            }, (error) => {
                console.log('error', error);
            });
        }
    }


    firstTuningModel( model ) {

        model.traverse( el => {
           if(el.material) {
               if(el.material.length){
                   el.material.forEach( el => el.side=THREE.DoubleSide )
               }
               else el.material.side=THREE.DoubleSide;
           }
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, .6);
        ambientLight.name = 'AmbientLight';
        model.add(ambientLight);
    }


    onDrop( acceptedFiles ) {
        this.uploadModelFiles = [];

        acceptedFiles.forEach(file => {
            console.log('FILE: ', file);
            this.uploadModelFiles.push( file );
        });

        this.forceUpdate();
    }


    render() {
        const { classes } = this.props;

        const isUploadDisabled = () => {

            if(this.state.uploadModelName && this.uploadModelFiles && this.uploadModelFiles.length) {
                return(
                    <Button
                        variant="contained"
                        color="primary"
                        className={classNames(classes.button, classes.btnUploadModel)}
                        onClick={()=>this.uploadModel()}>
                        Upload & edit
                        <CloudUploadIcon className={classes.rightIcon} />
                    </Button>
                )
            }

            return(
                <Button
                    variant="contained"
                    color="primary"
                    disabled
                    className={classNames(classes.button, classes.btnUploadModel)}
                    onClick={()=>this.uploadModel()}>
                    Upload & edit
                    <CloudUploadIcon className={classes.rightIcon} />
                </Button>
            )
        };

        return (
            <section className="admin-panel">

                <div className="wrap-admin-panel-header">

                    <div className="wrap-tag-list">
                        <Chip
                            label="Tag 1"
                            className={classNames(classes.chip, "model-tag")}
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={(event)=>this.toggleTab(event)}
                        />

                        <Chip
                            label="Selected Tag 2"
                            className={classNames(classes.chip, "model-tag selected")}
                            color="primary"
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Tag 3"
                            className={classNames(classes.chip, "model-tag")}
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Tag 3"
                            className={classNames(classes.chip, "model-tag")}
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Tag 3"
                            className={classNames(classes.chip, "model-tag")}
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Selected Tag 4"
                            className={classNames(classes.chip, "model-tag selected")}
                            color="primary"
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Selected Tag 2"
                            className={classNames(classes.chip, "model-tag selected")}
                            color="primary"
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Selected Tag 5"
                            className={classNames(classes.chip, "model-tag selected")}
                            color="primary"
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />

                        <Chip
                            label="Tag 4"
                            className={classNames(classes.chip, "model-tag")}
                            onDelete={()=>{}}
                            deleteIcon={<DoneIcon />}
                            onClick={()=>{}}
                        />
                    </div>


                    <div className="wrap-loadbtn-model">
                        <Button variant="contained" color="primary" className={classes.button} onClick={()=>this.handleClickOpen()}>Load model</Button>
                        <Dialog
                            open={this.state.isModalOpen}
                            onClose={()=>this.handleClose()}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description" >

                            <DialogTitle className={classes.uploadModalTitle}>Upload model</DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    <TextField
                                        label="Model name"
                                        className={classNames(classes.textField, classes.modelName, classes.w100p)}
                                        margin="dense"
                                        onChange={ (event)=>this.setState({ uploadModelName: event.target.value }) }/>

                                    <Dropzone onDrop={this.onDrop.bind(this)} className="dropzone" >
                                        <p className="dropzone-text">Drop files here or click to upload.</p>
                                    </Dropzone>

                                </DialogContentText>

                                { isUploadDisabled() }
                            </DialogContent>

                        </Dialog>
                    </div>
                </div>

                <Paper className="wrap-table-list">
                    <Table className="model-list">
                        <TableBody>
                            {this.props.modelList.map(model => {
                                return (
                                    <TableRow key={model._id}>
                                        <TableCell component="th" scope="row">
                                            <h2>{model.name}</h2>
                                        </TableCell>
                                        <TableCell className="small-t_cell">
                                            <Button
                                                variant="contained"
                                                size="small"
                                                className={classes.button}
                                                onClick={() => this.onCopyLink(model._id)} >
                                                Copy link
                                            </Button>
                                        </TableCell>
                                        <TableCell className="small-t_cell">
                                            <Link to={`${Utils.getPrefixLink()}/admin_panel/${model._id}`} className={classes.noTextDecor}>
                                                <Button variant="contained" color="primary" size="small" className={classes.button}>Edit</Button>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="small-t_cell">
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                size="small"
                                                className={classes.button}
                                                onClick={() => this.props.deleteModel(model._id)}>
                                                Delete

                                                <DeleteIcon className={classNames(classes.rightIcon, classes.iconSmall)} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Paper>

            </section>
        )
    }
}



export default compose(
    connect(
        state => ({
            modelList: state.modelList,
        }),
        dispatch => ({
            initModelList: (initQuizData) => {

                const myInit = {
                    method: 'GET',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    // mode: 'cors',
                    cache: 'default',
                };

                fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/getModel3DList`, myInit)
                    .then((res) => {
                        if (res.status == 200) return res.json();
                    })
                    .then((modelList) => {
                        console.log('modelList: ', modelList);

                        dispatch({type: ActionTypes.INIT_MODEL_LIST, payload: modelList});
                    })
                    .catch((reject) => {
                        console.log('reject', reject);
                    });
            },
            deleteModel: ( modelId ) => {
                console.log('deleteModel ---------------------- ', modelId);

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

                fetch(`${ServerConfig.apiPrefix}:${ServerConfig.serverPort}/removeModel/`, myInit)
                    .then((res) => {
                        if (res.status == 200) return res.json();
                    })
                    .then((data) => {
                        dispatch({type: ActionTypes.DELETE_MODEL, payload: modelId});
                    })
                    .catch((reject) => {
                        console.log('reject', reject)
                    });
            },

            initCurrModel: ( currModel ) => {
                dispatch({type: ActionTypes.INIT_CURR_MODEL, payload: currModel});
            }
        })
    ),
    withStyles( styles )
)(ModelList);