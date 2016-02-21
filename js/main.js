var container, scene, camera, renderer, raycaster;

init();
animate();

function init() {

	setup(); // Three.js setup

	initEnvironment();
}

function animate() {
	requestAnimationFrame( animate );

	if ( movementControls )
		movementControls.update();
	
	render();
}

function render() {

	renderer.clear();
	renderer.render( scene , camera );
}