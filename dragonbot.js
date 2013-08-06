//DragonBot
//In Progress jakedageek
//latest version 0.1.0 8-5-13

// CoinChat bot

var io = require('socket.io-client');
socket = io.connect("https://coinchat.org", {secure: true});

var username = "DragonBot";
var outputBuffer = [];
var dragonhealth = 150;
var hero = "."
var balance = 0
socket.on('connect', function(){
		//Your session key (aka API key)
		//Get this from your browser's cookies.
    socket.emit('login', {session: "eiCfoHGhnP9mZCzwOhTVlBAZh7EfNZPStvR3SmERGbq7ROmf54KegCEfSRZz7rhk"});
    socket.on('loggedin', function(data){
    	username = data.username;
    	setTimeout(function(){
    			socket.emit("getcolors", {});
    			socket.emit('joinroom', {join: 'dragonbot'});
    			socket.emit("getbalance", {});
    			socket.on('chat', function(data){ //the program loops this bracket
                        console.log(data);
    					if (data.message === "!rules" && data.room === "dragonbot") {
                			outputBuffer.push({room: data.room, color: "000", message: data.user + ": Slay the dragon! The dragon initially has 150 health. Each swing reduces the health by a random amount between 0~100, and a 100 point swing instantly kills the dragon! Each swing is exactly 0.25 mBTC."});
                		}
                		if (data.message === "!balance" && data.room === "dragonbot") {
							socket.emit("getbalance", {});
							outputBuffer.push({room: data.room, color: "000", message: data.user + ": current balance of bot = " + data.balance});
                		}
                		if (data.message === "!hero" && data.room === "dragonbot") {
                			outputBuffer.push({room: data.room, color: "000", message: data.user + ": the last person to get a critical hit is " + hero + "!"});
                		}
                		if (data.message === "!health" && data.room === "dragonbot") {
                			outputBuffer.push({room: data.room, color: "000", message: data.user + ": the current health of the dragon is  " + dragonhealth + "!"});
                		}
						if(contains(data.message, ["<span class='label label-success'>has tipped " + username])){
							var stringamount = data.message.split("<span class='label label-success'>has tipped " + username + " ")[1].split(" ")[0];
							var player = data.user;
                            var amount = Number(stringamount);
							if(amount === 0.25){
								outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " takes a swing at the Dragon (" + dragonhealth + ") !"});
								var swing = Math.round(Math.random()*100); //random number from 0 to 0.99999... multiply by 100 and round.
                                console.log(swing);
								if(swing === 100){
									dragonhealth = 150; //reset dragon's health
									hero = data.user; //set user as hero
									outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has killed the dragon with a critical hit (100 rolled)!"});
									prize();//give prize
								}else{
									dragonhealth = dragonhealth - swing;
									outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has swung and dealt " + swing + " damage!"});
									if(dragonhealth <= 0){ //was the dragon killed?
										dragonhealth = 150; //reset dragon's health
										outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has killed the dragon!"}); //notify
										prize();//give prize
									}else{
										//state current health if dragon not killed
										outputBuffer.push({room: "dragonbot", color: "000", message: "The dragon now has " + dragonhealth + " health left!"});
									}
								}
							}else{
								var refamount = amount * 0.98;
								socket.emit("tip", {user: data.user, room: "dragonbot", tip: refamount, message: "refund! A hit costs exactly 0.25"});
							}
						}
					});
    			
    		}, 1000);
    	setInterval(function(){
    		//CoinChat has a 550ms anti spam prevention. You can't send a chat message more than once every 550ms.
    		if(outputBuffer.length > 0){
    			var chat = outputBuffer.splice(0,1)[0];
    			socket.emit("chat", {room: chat.room, message: chat.message, color: "000"});
    		}
    	}, 600);
  	//this is the weighted prize system.
  	//33.333% for 0.5~0.60.5
  	//26.667% for 0.6~0.7
  	//20% for 0.7~0.8
  	//13.333% for 0.8~0.9
  	//6.667% for 0.9~1
  	//numbers within the range are completely random.
  	//Expected value: 0.68
  	//note that the health is 150. expected value for each roll: 50. expected number of hits:3. expected number of money spent: 0.75
    function prize(){
    	var prizeweight = Math.round(Math.random()*100);
    	if(prizeweight < (100/3)){
    		//give the 0.5~0.6 prize
    		var prizeamount = ((Math.round(Math.random()*100))/1000)+0.5;
    		socket.emit("tip", {user: data.user, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
    	}else{
    		if(prizeweight < 60){
    			//give the 0.6~0.7 prize
    			var prizeamount = ((Math.round(Math.random()*100))/1000)+0.6;
    			socket.emit("tip", {user: data.user, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
    		}else{
    			if(prizeweight < 80){
    				//give the 0.7~0.8 prize
    				var prizeamount = ((Math.round(Math.random()*100))/1000)+0.7;
    				socket.emit("tip", {user: data.user, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
    			}else{
    				if(prizeweight < (280/3)){
    					//give the 0.8~0.9 prize
    					var prizeamount = ((Math.round(Math.random()*100))/1000)+0.8;
    					socket.emit("tip", {user: data.user, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
    				}else{
    					//give the 0.9~1 prize
    					var prizeamount = ((Math.round(Math.random()*100))/1000)+0.9;
    					socket.emit("tip", {user: data.user, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
    				}
    			}
    		}
    	}
    }

    });
    socket.on('disconnect', function(){});
});
function contains(string, terms){
	for(var i=0; i<terms.length; i++){
		if(string.toLowerCase().indexOf(terms[i].toLowerCase()) == -1){
			return false;
		}
	}
	return true;
}