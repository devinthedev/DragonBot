//DragonBot
//In Progress jakedageek
//latest version 0.0.6 8-6-13

// CoinChat bot

var io = require('socket.io-client');
socket = io.connect("https://coinchat.org", {secure: true});

var username = "DragonBot";
var outputBuffer = [];
var tipBuffer = [];
var dragonhealth = 100;
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
        			outputBuffer.push({room: data.room, color: "000", message: data.user + ": Slay the dragon! The dragon initially has 100 health. Each swing reduces the health by a random amount between 0~100, and a 100 point swing instantly kills the dragon! Each swing is exactly 0.25 mBTC. When you kill the dragon, you can get a prize of anywhere from 0.5~1mBTC (weighted)! House Edge: 3.2% (includes tax)"});
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
                if (data.message === "!commands" && data.room === "dragonbot") {
                    outputBuffer.push({room: data.room, color: "000", message: data.user + ": !rules, !hero, !health, !commands"});
                }
				if(contains(data.message, ["<span class='label label-success'>has tipped " + username])){
                    var stringamount = data.message.split("<span class='label label-success'>has tipped ")[1].split(" ")[1];
                    amount = Number(stringamount);
					var player = data.user;
					if(amount === 0.25){
						outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " takes a swing at the Dragon (" + dragonhealth + ") !"});
						var swing = Math.ceil(Math.random()*100); //random number from 0 to 0.99999... multiply by 100 and round.
                        console.log(swing);
						if(swing === 100){
							dragonhealth = 150; //reset dragon's health
							hero = data.user; //set user as hero
							outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has killed the dragon with a critical hit (100 rolled)!"});
							prize(data.user);//give prize
						}else{
							dragonhealth = dragonhealth - swing;
							outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has swung and dealt " + swing + " damage!"});
							if(dragonhealth <= 0){ //was the dragon killed?
								dragonhealth = 150; //reset dragon's health
								outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has killed the dragon!"}); //notify
								prize(data.user);//give prize
							}else{
								//state current health if dragon not killed
								outputBuffer.push({room: "dragonbot", color: "000", message: "The dragon now has " + dragonhealth + " health left!"});
							}
						}
					}else{
						var refamount = amount * 0.98;
						tipBuffer.push({user: data.user, room: "dragonbot", tip: refamount, message: "refund! A hit costs exactly 0.25"});
					}
				}
			});
		}, 1000);
    	setInterval(function(){
    		//CoinChat has a 550ms anti spam prevention. You can't send a chat message more than once every 550ms.
    		if(outputBuffer.length > 0){
    			var chat = outputBuffer.splice(0,1)[0];
    			socket.emit("chat", {room: chat.room, message: chat.message, color: "000"});
    		}else if(tipBuffer.length>0){
                var tip = tipBuffer.splice(0,1)[0];
                socket.emit("tip", {room: tip.room, message: tip.message, user: tip.user, tip: tip.tip});
            }
    	}, 600);
        function prize(prizeuser){
        	var prizeweight = Math.round(Math.random()*100);
            console.log(prizeweight)
        	if(prizeweight < (48)){
        		//give the 0.5~0.6 prize
        		var prizeamount = ((Math.round(Math.random()*100))/1000)+0.5;
        		tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	}else if(prizeweight < 80){
    			//give the 0.6~0.7 prize
    			var prizeamount = ((Math.round(Math.random()*100))/1000)+0.6;
    			tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	}else if(prizeweight < 93){
    			//give the 0.7~0.8 prize
    			var prizeamount = ((Math.round(Math.random()*100))/1000)+0.7;
    			tipBuffer.push({user: prizeusser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	}else if(prizeweight < (98)){
        		//give the 0.8~0.9 prize
        		var prizeamount = ((Math.round(Math.random()*100))/1000)+0.8;
        		tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	}else{
    			//give the 0.9~1 prize
    			var prizeamount = ((Math.round(Math.random()*100))/1000)+0.9;
    			tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
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