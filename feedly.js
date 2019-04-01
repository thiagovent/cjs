// config items to remove:
let spoilerAlert = ["Stranger Things"];
let log = true;
let interval = 500;

// script:
let spoilersCount = 0;
setInterval( function() {
	let stories = document.getElementsByClassName("entryholder");
	for (let item of spoilerAlert) {
		for (var j = 0; j < stories.length; j++) {
			 if (stories[j].innerHTML.indexOf(item) >= 0) {
			   stories[j].remove();
			   log && console.log("Spoiler removed (" + (++spoilersCount) + ")");
		   }
		}
	}

}, interval);
