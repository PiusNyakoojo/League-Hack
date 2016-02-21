var username;
var lobbyValue, teamValue;
var playersPerTeam = 2;

var playerReady = 0;

var isInLobby = false;
var isReady = false;

var isPlaying = false;

var player;
var otherPlayers = {};

var movementControls;

var tempKey, tempVal;

var defaultStart = {
	"teamA": {
		position: { x: -220, y: 5, z: 220 },
		rotation: { x: 0, y: 0, z: 0 }
	},
	"teamB": {
		position: { x: 220, y: 5, z: -220 },
		rotation: { x: 0, y: 0, z: 0 }
	}
};

function startGame() {

	initGame();

	isPlaying = true;

	hideElement( "lobbyPanel" );
	hideElement( "signInBG" );

	initPlayer();

	for ( var id in allPlayers ) {
		console.log( "Key: " + id + ", Value: " + allPlayers[id]["type"] );
		otherPlayers[id] = getModel( id, allPlayers[id]["type"] );
		firebase.child( "Users" ).child( id ).on( "value", updatePlayer );
		scene.add( otherPlayers[id] );
	}
	
}

function initGame() {
	firebase.child("Lobby").child( lobbyValue ).update( { "inSession": true } );
}

function endGame() {
	showElement( "lobbyPanel" );
	showElement( "signInBG" );

	firebase.child("Lobby").child( lobbyValue ).update( { "inSession": false } );
}

function updatePlayer( snapshot ) {
	tempKey = snapshot.key();
	tempVal = snapshot.val();
	
	if ( tempVal["Action"] ) {
		otherPlayers[tempKey].position.x = tempVal["Action"]["position"].x;
		otherPlayers[tempKey].position.y = tempVal["Action"]["position"].y;
		otherPlayers[tempKey].position.z = tempVal["Action"]["position"].z;

		otherPlayers[tempKey].rotation.x = tempVal["Action"]["rotation"].x;
		otherPlayers[tempKey].rotation.y = tempVal["Action"]["rotation"].y;
		otherPlayers[tempKey].rotation.z = tempVal["Action"]["rotation"].z;
	}
	

}

function initPlayer() {
	player = getModel( username, currentHero );

	movementControls = new THREE.PlayerControls( camera, player );

	movementControls.init();
	camera.lookAt( scene.position );

	scene.add( player );
}

function getModel( id, hero ) {
	var material = new THREE.MeshNormalMaterial();
	var geometry;

	switch( hero ) {
		case "sphere":
			geometry = new THREE.SphereGeometry( 2, 32, 32 );
			break;
		case "cube":
			geometry = new THREE.BoxGeometry( 1, 1, 1 );
			break;
		case "torus":
			geometry = new THREE.TorusGeometry( 1, 0.5, 16, 50 );
			break;
		case "torusKnot":
			geometry = new THREE.TorusKnotGeometry( 1, 0.3, 50, 16 );
			break;
		case "cylinder":
			geometry = new THREE.CylinderGeometry( 1, 1, 2, 32 );
			break;
		default:
			geometry = new THREE.PlaneBufferGeometry( 2, 3, 32 );
	}

	var model;

	if ( hero == "sphere" || hero == "cube" || hero == "torus" || hero == "torusKnot" || hero == "cylinder" ) {
		model = new THREE.Mesh( geometry, material );
	} else {
		if ( hero == null ) {
			texture = THREE.ImageUtils.loadTexture( "images/" + "nickCage" + ".png" );
		} else {
			texture = THREE.ImageUtils.loadTexture( "images/" + hero + ".png" );
		}
		texture.wrapS = THREE.RepeatWrapping; 
		texture.wrapT = THREE.RepeatWrapping;
		texture.minFilter = THREE.LinearFilter;

		material = new THREE.MeshLambertMaterial( { map : texture } );
		material.side = THREE.DoubleSide;

		model = new THREE.Mesh( geometry, material );
	}

	var tempTeam;

	if ( teammates[id] || id == username ) {
		tempTeam = teamValue;
	} else {
		tempTeam = teamValue == "teamA" ? "teamB" : "teamA";
	}

	model.position.x = defaultStart[tempTeam].position.x;
	model.position.y = defaultStart[tempTeam].position.y;
	model.position.z = defaultStart[tempTeam].position.z;

	model.rotation.x = defaultStart[tempTeam].rotation.x;
	model.rotation.y = defaultStart[tempTeam].rotation.y;
	model.rotation.z = defaultStart[tempTeam].rotation.z;
	
	return model;
}

function initEnvironment() {

	/* Summoner's Rift */
	jsonLoader.load( "models/rift.json", function( geometry, materials ) {
		for ( var i = 0; i < materials.length; i++ ) {
			materials[i].side = THREE.DoubleSide;
		}

		var rift = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

		rift.scale.x = rift.scale.y = rift.scale.z = 20;

		scene.add( rift );
	} );

}