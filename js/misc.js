var characterSpotLight;
var platform;
var jsonLoader;

function setup() {

    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 5;
    camera.position.y = 5;

    camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setSize( window.innerWidth, window.innerHeight);

    raycaster = new THREE.Raycaster();
    
    initJSONLoader();
    initLights();
    loadSky();

    window.addEventListener( 'resize', onWindowResize, false );

    // Final touches
    container.appendChild( renderer.domElement );
    document.body.appendChild( container );
}

function loadSky() {
    var geometry = new THREE.SphereGeometry( 5000, 20, 20 );
    var material = new THREE.MeshBasicMaterial();
    var texture = THREE.ImageUtils.loadTexture( "images/sky.jpg" );
    texture.minFilter = THREE.NearestFilter;
    material.map = texture;
    material.side = THREE.BackSide;
    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
}


function initLights() {
    
	var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, 5).normalize();
    scene.add(directionalLight);
    
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 5, 0).normalize();
    scene.add(directionalLight);
    
    
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, -5).normalize();
    scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(5, 0, 0).normalize();
    scene.add(directionalLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(-5, 0, 0).normalize();
    scene.add(directionalLight);
	
    characterSpotLight = new THREE.SpotLight( 0xffffff );
	scene.add( characterSpotLight );
    
}

function initJSONLoader() {
    jsonLoader = new THREE.JSONLoader();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}