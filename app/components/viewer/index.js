import TWEEN from '@tweenjs/tween.js';

class Viewer {
    constructor() {
        window.scene = this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf6f6f6);

        this.defaultCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
        this.defaultCamera.name = "PerspectiveCamera";
        this.defaultCamera.position.set(100, 200, 300);
        this.camera = this.defaultCamera.clone();
        this.scene.add(this.camera);

        // const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        // grid.name = "GridHelper";
        // grid.material.opacity = 0.2;
        // grid.material.transparent = true;
        // this.scene.add(grid);

        this.groupLightHelpers = new THREE.Group();
        this.groupLightHelpers.name = 'GroupLightHelpers';
        this.scene.add(this.groupLightHelpers);


        this.renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
        // this.renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
        // this.renderer.setClearColor(0x000000, 1.0);

        this.orbitControls = new THREE.OrbitControls(this.defaultCamera.clone(), this.renderer.domElement);
        this.orbitControls.screenSpacePanning = true;
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.12;
        this.orbitControls.panSpeed = .07;
        this.orbitControls.rotateSpeed = .1;

        this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.name = 'TransformControls';
        this.transformControls.setSpace('local');
        this.scene.add(this.transformControls);

        this.raycaster = new THREE.Raycaster();

        this.initEvents();

        this.controlsChaned = false;
        this.viewType = null;
    }


    initEvents() {
        this.transformControls.addEventListener('dragging-changed', (event) => {
            this.orbitControls.enabled = !event.value;
        });

        this.transformControls.addEventListener('change', () => { this.controlsChaned = true; this.scaleTransformControls() });
        this.orbitControls.addEventListener('change', () => this.controlsChaned = true);

        document.addEventListener('mousedown', () => this.controlsChaned = false);
        document.addEventListener('mouseup', (event) => this.onMouseup(event));
        window.addEventListener('resize', () => this.updateDimensions());
    }

    scaleTransformControls(scaleVal) {
        const newScaleVal = scaleVal ? scaleVal : this.camera.fov / 45;
        this.transformControls.scale.set(newScaleVal, newScaleVal, newScaleVal);
    }


    onMouseup(event) {
        if (event.target !== this.renderer.domElement) return;
        if (this.controlsChaned || this.viewType) return;

        const mouse = new THREE.Vector2();

        mouse.x = (event.layerX / this.renderer.domElement.offsetWidth) * 2 - 1;
        mouse.y = -(event.layerY / this.renderer.domElement.offsetHeight) * 2 + 1;

        this.raycaster.setFromCamera(mouse, this.camera);


        const intersectsLight = this.raycaster.intersectObjects(this.groupLightHelpers.children);

        if (intersectsLight.length) {
            this.transformControls.attach(intersectsLight[0].object.light);
            this.transformControls.setMode("translate");
        }
        else {
            let intersectsModel = [];

            if (this.model)
                intersectsModel = this.raycaster.intersectObjects(this.model.getObjectByName('MeshList').children);

            if (intersectsModel.length) {
                this.transformControls.attach(this.model.children[0]);
                this.transformControls.setMode("rotate");
            }
            else {
                const transfControlsArrows = this.transformControls.children[0].children[3].children;
                const intersectsArrows = this.raycaster.intersectObjects(transfControlsArrows);

                if (!intersectsArrows.length) this.transformControls.detach();
            }
        }
    }


    transformControlsAttach( el ) {
        if(el.isAmbientLight)  return;

        this.transformControls.attach( el );
        if( el.isLight ) this.transformControls.setMode("translate");
        if( el.isMesh )  this.transformControls.setMode("rotate");
    }


    addModelToScene(model, viewType) {
        this.model = model;

        this.scene.background.setHex( this.model.userData.bg );

        const modelCamera = this.model.getObjectByName('PerspectiveCamera');
        if(modelCamera) this.camera = modelCamera.clone();
        else {
            this.camera = this.defaultCamera.clone();

            const meshGroup = new THREE.Group();
            this.model.traverse( el => {
                if(el.isMesh) meshGroup.add(el.clone());
            });

            const b = new THREE.Box3().setFromObject( meshGroup );
            this.camera.position.copy( b.max.clone().multiplyScalar(6) );
            this.camera.position.setY( this.camera.position.y/5 );
        }

        this.transformControls.camera = this.camera;
        this.orbitControls.object = this.camera;
        this.orbitControls.update();
        this.updateDimensions();

        this.scene.add(this.model);
        this.viewType = viewType;


        const meshGroup = new THREE.Group();
        this.model.children.forEach( el => {
            if(!el.isCamera) meshGroup.add(el.clone());
        });

        const b = new THREE.Box3().setFromObject( this.model );
        const vec = new THREE.Vector3();
        b.getCenter(vec);
        this.model.position.sub(vec);
        this.model.updateMatrix();
    }

    resetCameraPos() {
        const meshGroup = new THREE.Group();

        this.model.traverse( el => {
            if(el.isMesh) meshGroup.add(el.clone());
        });


        const b = new THREE.Box3().setFromObject( meshGroup );
        const startCameraPos = this.camera.position.clone();
        const finishCameraPos = b.max.clone().multiplyScalar(6);
        finishCameraPos.setY( finishCameraPos.y/5 );
        finishCameraPos.multiplyScalar(45 / this.camera.fov);

        new TWEEN.Tween({alpha: 0}).to({alpha: 1}, startCameraPos.distanceTo(finishCameraPos))
            .onStart( () => this.orbitControls.enabled = false )
            .onUpdate(({alpha}) => {
                this.orbitControls.object.position.copy( startCameraPos.clone().lerp(finishCameraPos, alpha) );
                this.orbitControls.object.lookAt(0, 0, 0);
                this.orbitControls.update();
            })
            .onComplete( () => this.orbitControls.enabled = true )
            .easing(TWEEN.Easing.Sinusoidal.Out)
            .start();

        this.camera.lookAt(0,0,0);
        this.camera.updateMatrix();
    }


    removeLight(light) {
        const lightHelper = this.groupLightHelpers.children.find(el => el.light && el.light.uuid == light.uuid);

        this.groupLightHelpers.remove(lightHelper);
        this.model.remove(light);
    }

    addLightHelper(light, name) {
        const lightHelper = new THREE.PointLightHelper(light, 3);
        if (lightHelper) lightHelper.name = name;
        this.groupLightHelpers.add(lightHelper);
    }

    updateDimensions() {
        const wrapperCanvas = this.renderer.domElement.parentElement;

        if (wrapperCanvas) {
            this.renderer.setSize(wrapperCanvas.offsetWidth, wrapperCanvas.offsetHeight);
            this.camera.aspect = wrapperCanvas.offsetWidth / wrapperCanvas.offsetHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    animate() {
        TWEEN.update();
        this.orbitControls.update();
        this.renderer.render(this.scene, this.camera);
        this.animationID = window.requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        this.animate();
    }

    cancelAnimation() {
        window.cancelAnimationFrame(this.animationID);
        this.animationID = null;
    }

    attach(wrapCanvas) {
        wrapCanvas.appendChild(this.renderer.domElement);
        this.updateDimensions();
        this.startAnimation();
    }

    hideHelpElements() {
        this.transformControls.detach();
        this.scene.getObjectByName('GroupLightHelpers').visible = false;
    }

    getPreviewImg() {
        const canvasImg = this.renderer.domElement.toDataURL('image/jpeg', 1.0);
        setTimeout(()=>this.scene.getObjectByName('GroupLightHelpers').visible = true, 1);

        return canvasImg;
    }

    updateCanvasSizeDimensions() {
        this.camera.aspect = this.renderer.domElement.offsetWidth / this.renderer.domElement.offsetHeight;
        this.camera.updateProjectionMatrix();
    }

    detach(wrapCanvas) {
        wrapCanvas.removeChild(this.renderer.domElement);
        this.cancelAnimation();
        this.transformControls.detach();
        this.scene.remove(this.scene.getObjectByName("Model3D"));
        this.groupLightHelpers.children = [];
    }

}

const viewer = new Viewer();
window.v = viewer;

export default viewer;