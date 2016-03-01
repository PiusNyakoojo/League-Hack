var firebase = new Firebase( "https://leaguehack.firebaseio.com" );
var uid = "";

var teammates = {};
var opponents = {};
var allPlayers = {};

var currentHero = "sphere";
var heroes = ["sphere", "cube", "torus", "torusKnot", "cylinder", "nickCage", "china", "google", "imo","apple", "microsoft", "kcg", "lawrence", "salesforce", "wolfram", "capitalone", "facebook", "amadeus", "att", "indeed"];
var heroesStats = {
	"sphere": {
		"health": 0,
		"strength": 5,
		"speed": 10
	},
	"cube": {
		"health": 0,
		"strength": 5,
		"speed": 10
	},
	"torus": {
		"health": 3,
		"strength": 50,
		"speed": 10
	},
	"torusKnot": {
		"health": 10,
		"strength": 13,
		"speed": 6
	},
	"cylinder": {
		"health": 12,
		"strength": 13,
		"speed": 3
	},
	"nickCage": {
		"health": 30,
		"strength": 2,
		"speed": 1
	},
	"china": {
		"health": 0,
		"strength": 5,
		"speed": 10
	},
	"google": {
		"health": 600613,
		"strength": 600613,
		"speed": 600613
	},
	"imo": {
		"health": 3,
		"strength": 50,
		"speed": 10
	},
	"apple": {
		"health": "keeps",
		"strength": "doctors",
		"speed": "away!"
	},
	"microsoft": {
		"health": 12,
		"strength": "hella strong",
		"speed": 3
	},
	"kcg": {
		"health": 30,
		"strength": 2,
		"speed": 1
	},
	"lawrence": {
		"health": 0,
		"strength": 5,
		"speed": 10
	},
	"salesforce": {
		"health": 0,
		"strength": 5,
		"speed": 10
	},
	"wolfram": {
		"health": 3,
		"strength": 50,
		"speed": 10
	},
	"capitalone": {
		"health": 10,
		"strength": 13,
		"speed": 6
	},
	"facebook": {
		"health": 12,
		"strength": "Holy balls",
		"speed": "f === fast"
	},
	"amadeus": {
		"health": 30,
		"strength": 2,
		"speed": 1
	},
	"att": {
		"health": 12,
		"strength": 13,
		"speed": 3
	},
	"indeed": {
		"health": 30,
		"strength": 2,
		"speed": 1
	}
}

function authWith( provider ) {

	firebase.authWithOAuthPopup( provider, authHandler);

}

function authHandler( error, authData ) {
	if ( error ) {
		//console.log( "Login Failed!", error );
	} else {
		//console.log( "Authenticaed successfully with payload: ", authData );
		uid = authData.uid;

		hideElement( "signInPanel" );

		firebase.child( "UidMap" ).child( uid ).once( "value", function( snapshot ) {
			if ( snapshot.val() ) { // veteran account

				username = snapshot.val();
				// CHeck if they are already online
				firebase.child( "Users" ).child( username ).once( "value", function( snappy ) {
					if ( snappy.val().isOnline ) {
						alert( "Stop trollin'" );
					} else {
						joinLobby();
					}
				} );

			} else { // new account

				showElement( "usernamePanel" );

			}
		} );

	}
}

function joinLobby() {
	firebase.child( "Lobby" ).once( "value", function( snapshot ) {
		if ( !snapshot.val() ) {
			initLobby( "0", "teamA" );
		} else {

			var i = 0;

			for ( var key in snapshot.val() ) {
				
        if ( !snapshot.val()[key].inSession ) {
           if ( Object.keys( snapshot.val()[key].teamA ).length < playersPerTeam ) {

              initLobby( key, "teamA" );
              return;
             
            } else if ( snapshot.val()[key].teamB ) {
              if ( Object.keys( snapshot.val()[key].teamB ).length < playersPerTeam ) {
                
                initLobby( key, "teamB" );
                return;
                
              }
            } 
        }

				i++;
			}

			initLobby( i, "teamA" );
		}
		
	} );
}


function initLobby( lobbyNum, team ) {
	isInLobby = true;
	lobbyValue = lobbyNum;
	teamValue = team;

	/* setup */
	firebase.child( "Lobby" ).child( lobbyNum ).child( team ).child( username ).set( 0 );
	firebase.child( "Users" ).child( username ).child( "Team" ).set( team );
	firebase.child( "Users" ).child( username ).child( "Lobby" ).set( lobbyNum );
	firebase.child( "Users" ).child( username ).child( "isOnline" ).set( true );

	firebase.child( "Lobby" ).child( lobbyNum ).child( team ).child( username ).onDisconnect().remove();
	firebase.child( "Users" ).child( username ).child( "Team" ).onDisconnect().remove();
	firebase.child( "Users" ).child( username ).child( "Lobby" ).onDisconnect().remove();
	firebase.child( "Users" ).child( username ).child( "Action" ).onDisconnect().remove();
	firebase.child( "Users" ).child( username ).child( "isOnline" ).onDisconnect().set( false );

	/* listen to lobby */
	console.log( team == "teamA" ? "teamB" : "teamA" );
	firebase.child( "Lobby" ).child( lobbyNum ).child( (team == "teamA" ? "teamB" : "teamA") ).on( "child_added", addOppToLobby );
	firebase.child( "Lobby" ).child( lobbyNum ).child( team ).on( "child_added", addHelpToLobby );

	firebase.child( "Lobby" ).child( lobbyNum ).child( (team == "teamA" ? "teamB" : "teamA") ).on( "child_removed", removeOppFromLobby );
	firebase.child( "Lobby" ).child( lobbyNum ).child( team ).on( "child_removed", removeHelpFromLobby );

	/* gui setup */
	$( "#usernameTitle" ).text( username );

	/* show lobby */
	showElement( "lobbyPanel" );
}

function addOppToLobby( snapshot ) {
	//console.log( "add opp:" + snapshot.key() );

	opponents[snapshot.key()] = generatePlayerPanel( snapshot.key() );
	opponents[snapshot.key()].id = "opp-" + snapshot.key();
	$( "#oppTeamContent" ).append( opponents[snapshot.key()] );

	if ( !allPlayers[snapshot.key()] )
		allPlayers[snapshot.key()] = {};

	allPlayers[snapshot.key()]["isReady"] = false;

	firebase.child( "Lobby" ).child( lobbyValue ).child( (teamValue == "teamA" ? "teamB" : "teamA") ).child( snapshot.key() ).on( "value", function( childSnapshot ) {
		if ( childSnapshot.val() != 0 ) {
			onPlayerReady( snapshot.key(), childSnapshot.val() );
		} else {
			onPlayerUnready( snapshot.key() );
		}
 	} );

}

function removeOppFromLobby( snapshot ) {
	$( "#opp-" + snapshot.key() ).remove();
	delete opponents[snapshot.key()]["panel"];

	if ( allPlayers[snapshot.key()] )
		delete allPlayers[snapshot.key()];

	firebase.child( "Lobby" ).child( lobbyValue ).child( (teamValue == "teamA" ? "teamB" : "teamA") ).child( snapshot.key() ).off( "value", function( snappy ) { } );

	if ( isPlaying && Object.keys( allPlayers ).length == 0 ) {
		teammates = {};
		opponents = {};
		allPlayers = {};
		endGame();
	}
}

function addHelpToLobby( snapshot ) {

	if ( username != snapshot.key() ) {

		teammates[snapshot.key()] = generatePlayerPanel( snapshot.key() );
		teammates[snapshot.key()].id = "help-" + snapshot.key();
		$( "#yourTeamContent" ).append( teammates[snapshot.key()] );

		if ( !allPlayers[snapshot.key()] )
			allPlayers[snapshot.key()] = {};

		allPlayers[snapshot.key()]["isReady"] = false;

		firebase.child( "Lobby" ).child( lobbyValue ).child( teamValue ).child( snapshot.key() ).on( "value", function( childSnapshot ) {
			if ( childSnapshot.val() != 0 ) {
				onPlayerReady( snapshot.key(), childSnapshot.val() );
			} else {
				onPlayerUnready( snapshot.key() );
			}
	 	} );
	}
}

function removeHelpFromLobby( snapshot ) {

	$( "#help-" + snapshot.key() ).remove();
	delete teammates[snapshot.key()];

	if ( allPlayers[snapshot.key()] )
		delete allPlayers[snapshot.key()];

	firebase.child( "Lobby" ).child( lobbyValue ).child( teamValue ).child( snapshot.key() ).off( "value", function( snappy ) { } );

}

function generatePlayerPanel( name ) {
	var content = document.createElement( "div" );
	content.className = "teamContent";

	var icon = document.createElement( "div" );
	icon.className = "teamIcon";
	icon.id = "cont-" + name;

	var iconFrame = document.createElement( "iframe" );
	iconFrame.src = "";
	iconFrame.id = "frame-" + name;
	iconFrame.frameBorder = "0";

	icon.appendChild( iconFrame );
	iconFrame.style.width = "100%";
	iconFrame.style.height = "100%";

	var title = document.createElement( "div" );
	title.className = "teamName";
	title.innerHTML = name;

	content.appendChild( icon );
	content.appendChild( title );

	return content;
}

function toggleReady() {
	if ( !isReady ) {
		$( "#readyPromptBtn" ).text( "Not Ready" );
		$( "#readyPromptBtn" ).css( { "background-color": "grey" } );
		$( "#previousHeroBtn" ).prop( 'onclick', null ).off( 'click' );
		$( "#nextHeroBtn" ).prop( 'onclick', null ).off( 'click' );
		firebase.child( "Lobby" ).child( lobbyValue ).child( teamValue ).child( username ).set( currentHero );

		playerReady = 1;
	} else {
		$( "#readyPromptBtn" ).text( "Ready" );
		$( "#readyPromptBtn" ).css( { "background-color": "#e2040b" } );
		$( "#previousHeroBtn" ).click( previousHero );
		$( "#nextHeroBtn" ).click( nextHero );
		firebase.child( "Lobby" ).child( lobbyValue ).child( teamValue ).child( username ).set( 0 );

		playerReady = 0;
	}

	checkIfGameReady();
	isReady = !isReady;
}

function onPlayerReady( id, type ) {
	$( "#frame-" + id ).attr( "src", "heroes/" + type + ".html" );
	$( "#cont-" + id ).css( { "border": "3px solid red" } );

	if ( !allPlayers[id] )
		allPlayers[id] = {};

	allPlayers[id]["isReady"] = true;
	allPlayers[id]["type"] = type;

	checkIfGameReady();
}

function onPlayerUnready( id, type ) {
	$( "#frame-" + id ).attr( "src", "" );
	$( "#cont-" + id ).css( { "border": "none" } );

	allPlayers[id]["isReady"] = false;
	delete allPlayers[id]["type"];

	checkIfGameReady();
}

function nextHero( ) {
	if ( currentHero == null )
		return;

	currentHero = heroes[( heroes.indexOf( currentHero ) + 1 ) % ( heroes.length - 1 )];
	$( "#heroFrame" ).attr( "src", "heroes/" + currentHero + ".html" );
	$( "#heroHealth" ).text(  heroesStats[currentHero].health );
	$( "#heroStrength" ).text(  heroesStats[currentHero].strength );
	$( "#heroSpeed" ).text(  heroesStats[currentHero].speed );
}

function previousHero() {
	if ( currentHero == null )
		return;

	currentHero = heroes[( ( heroes.indexOf( currentHero ) - 1 ) % ( heroes.length - 1 ) ) == -1 ? (heroes.length - 1) : ( ( heroes.indexOf( currentHero ) - 1 ) % ( heroes.length - 1 ) )];
	$( "#heroFrame" ).attr( "src", "heroes/" + currentHero + ".html" );
	$( "#heroHealth" ).text(  heroesStats[currentHero].health );
	$( "#heroStrength" ).text(  heroesStats[currentHero].strength );
	$( "#heroSpeed" ).text(  heroesStats[currentHero].speed );
}

function checkIfGameReady() {

	var count = 0 + playerReady ;

	for ( var mate in allPlayers ) {
		if ( allPlayers[mate]["isReady"] )
			count++;
	}

	//console.log( count );

	if ( count == ( playersPerTeam * 2 )) {
		console.log( "Game is starting" );
		startGame();
	}
}

function checkUsername() {

	if ( containsSpecials() ) {
		showElement( "charError" );
		return;
	} else {
		hideElement( "charError" );
	}

	firebase.child("Users").child( $( "#usernameInput" ).val() ).once( 'value', function( snapshot ) {
		//console.log( snapshot.val() );
		if ( snapshot.val() ) {
			showElement( "takenError" );
		} else {
			username = $( "#usernameInput" ).val();

			firebase.child( "UidMap" ).child( uid ).set( username );

			var userData = {};
			userData["isOnline"] = true;
			userData["Wins"] = 0;
			userData["Losses"] = 0;

			firebase.child( "Users" ).child( username ).set( userData );

			hideElement( "usernamePanel" );
			hideElement( "takenError" );

			joinLobby();
		}
	} );
}

function containsSpecials() {
	var str = $('#usernameInput').val();
	if( /^[a-zA-Z0-9- ]*$/.test(str) == false ) {
	    return true;
	}

	if ( $('#usernameInput').val().length == 0 ) {
		return true;
	}
	
	return false;
}