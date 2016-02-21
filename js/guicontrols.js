function toggleElement( id ) {
	if ( $( id ).display != "none" ) {
		hideElement( id );
	} else {
		showElement( id );
	}
}

function hideElement( id ) {
	$( "#" + id ).css({"display": "none"});
}

function showElement( id ) {
	$( "#" + id ).css({"display": "inherit"});
}