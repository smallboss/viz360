class Viewer {
    constructor() {
        this.scene = new THREE.Scene();
        window.scene = this.scene;
        this.scene.background = new THREE.Color(0xa0f0f0);
        // this.scene.fog = new THREE.Fog( 0xa0f0f0, 200, 1000 );

        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.9 / window.innerHeight * 0.9, 1, 10000);
        this.camera.name = "PerspectiveCamera";
        this.camera.position.set(100, 200, 300);
        this.scene.add(this.camera);

        const grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        grid.name = "GridHelper";
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add(grid);

        this.groupLightHelpers = new THREE.Group();
        this.groupLightHelpers.name = 'GroupLightHelpers';
        this.scene.add(this.groupLightHelpers);


        // this.renderer = new THREE.WebGLRenderer({antialias: true, canvas: this.modelViewer });
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
        this.renderer.setClearColor(0x000000, 1.0);
        // document.getElementById("wrap-canvas").appendChild(this.renderer.domElement);

        this.orbitControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

        // if(this.state.isAdmin){
        this.transformControls = new THREE.TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(this.transformControls);

        this.raycaster = new THREE.Raycaster();

        this.initEvents();
    }


    initEvents() {
        this.transformControls.addEventListener( 'dragging-changed', (event) => {
            this.orbitControls.enabled = !event.value;
        });

        document.addEventListener('mousedown', (event)=>this.raycarsModel(event) );
    }



    raycarsModel(event){
        const mouse = new THREE.Vector2();

        mouse.x = ( event.layerX / this.renderer.domElement.offsetWidth ) * 2 - 1;
        mouse.y = - ( event.layerY / this.renderer.domElement.offsetHeight ) * 2 + 1;

        this.raycaster.setFromCamera( mouse, this.camera );


        const intersectsLight = this.raycaster.intersectObjects( this.groupLightHelpers.children );

        if(intersectsLight.length) this.transformControls.attach( intersectsLight[0].object.light );
        else{
            // const intersectsModel = this.raycaster.intersectObjects( this.model.children );

            // if(intersectsModel.length)  this.transformControls.attach( intersectsModel[0] );
            // else{
                const transfControlsArrows = this.transformControls.children[0].children[3].children;
                const intersectsArrows = this.raycaster.intersectObjects( transfControlsArrows );

                if(!intersectsArrows.length) this.transformControls.detach();
            // }
        }
    }

    addModelToScene( model ) {
        this.model = model;
        this.model.name = `model3d`;
        this.scene.add(this.model);
    }

    transfContrlAttach( mesh ) {
        this.transformControls.attach( mesh );
    }

    transfContrlDettach( mesh ) {
        this.transformControls.detach( mesh );
    }

    sceneAdd( mesh, name ) {
        if(name) mesh.name = name;
        this.scene.add(mesh);
    }

    removeLight( light ) {
        const lightHelper = this.groupLightHelpers.children.find( el => el.light && el.light.uuid==light.uuid );

        console.log('lightHelper', lightHelper);

        this.groupLightHelpers.remove( lightHelper );
        this.model.remove( light );
    }

    getObjectByUuid( uuid ) {
        let object = null;

        this.scene.traverse( el => {
            if(el.uuid==uuid) object = el;
        });

        return object;
    }

    addLightHelper( light, name ) {
        const lightHelper = new THREE.PointLightHelper(light, 5);
        if(lightHelper) lightHelper.name = name;
        this.groupLightHelpers.add(lightHelper);
    }

    updateDimensions(div) {
        this.renderer.setSize(div.offsetWidth, div.offsetHeight);
        this.camera.aspect = div.offsetWidth / div.offsetHeight;
    }

    animate() {
        // this.controls.update();
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

    attach(div) {
        div.appendChild(this.renderer.domElement);
        this.updateDimensions(div);
        this.startAnimation();
    }

    detach(div) {
        div.removeChild(this.renderer.domElement);
        this.cancelAnimation();
        this.scene.remove(this.scene.getObjectByName("model3d"));
        this.groupLightHelpers.children = [];
    }

}

const viewer = new Viewer();

export default viewer;