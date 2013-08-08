//DragonBot
//In Progress jakedageek
//latest version 0.1.1 8-8-13

// CoinChat bot

var io = require('socket.io-client');
socket = io.connect("https://coinchat.org", {secure: true});

var username = "DragonBot";
var outputBuffer = [];
var tipBuffer = [];
var statichealth = 100;
var dragonhealth = 100;
var hero = ".";
var balance = 0;
var i = 0;
socket.on('connect', function(){
		//Your session key (aka API key)
		//Get this from your browser's cookies.
    socket.emit('login', {session: "TK7JIadiBtIHMISW7eZU97bHYYc0waPUaCS3dfIDnIAilX4TvnQaQ8LWxZAGXwI9"});
    socket.on('loggedin', function(data){
    	username = data.username;
    	setTimeout(function(){
			socket.emit("getcolors", {});
			socket.emit('joinroom', {join: 'dragonbot'});
			socket.emit("getbalance", {});
			socket.on('chat', function(data){ //the program loops this bracket
				if (data.message === "!rules" && data.room === "dragonbot") {
        			outputBuffer.push({room: data.room, color: "000", message: data.user + ": Slay the dragon! The dragon initially has 100 health. Each swing reduces the health by a random amount between 1~100, and a 100 point swing instantly kills the dragon! Each swing is exactly 0.25 mBTC. When you kill the dragon, you can get a prize of anywhere from 0.5~1mBTC (weighted)! If you roll a 100 for the first swing, you get 1mBTC! House Edge: 4.2% (includes tax)"});
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
						var swing = Math.ceil((Math.random()*100)/2); //random number from 1 to 50
                        console.log(swing);
						dragonhealth = dragonhealth - swing;
						if(dragonhealth <= 0){ //was the dragon killed?
							dragonhealth = statichealth + dragonhealth; //reset dragon's health
							outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has swung and dealt " + swing + " damage, killing the dragon!"}); //notify
							prize(data.user); give prize
						}else{
							//state current health if dragon not killed
							outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has swung and dealt " + swing + " damage, and the dragon now has " + dragonhealth + " health left!"});
						}
					}else{
						var refamount = amount * 0.98;
						tipBuffer.push({user: data.user, room: "dragonbot", tip: refamount, message: "refund! A hit costs exactly 0.25"});
					}
				}
			});
		}, 1500);
    	setInterval(function(){
    		//CoinChat has a 550ms anti spam prevention. You can't send a chat message more than once every 550ms.
    		if(tipBuffer.length>0){
                var tip = tipBuffer.splice(0,1)[0];
                socket.emit("tip", {room: tip.room, message: tip.message, user: tip.user, tip: tip.tip});
            }else if(outputBuffer.length > 0){
                var chat = outputBuffer.splice(0,1)[0];
                socket.emit("chat", {room: chat.room, message: chat.message, color: "000"});
            }
    	}, 600);
        function prize(prizeuser){
            var prizeamount = (Math.random() * 1.38) + 0.25;
            tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"})
        	//var prizeweight = Math.round(Math.random()*100);
            //console.log(prizeweight)
        	//if(prizeweight < (56)){
        	//	//give the 0.5~0.6 prize
        	//	var prizeamount = ((Math.round(Math.random()*100))/1000)+0.5;
        	//	tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	//}else if(prizeweight < 83){
    		//	//give the 0.6~0.7 prize
    		//	var prizeamount = ((Math.round(Math.random()*100))/1000)+0.6;
    		//	tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	//}else if(prizeweight < 97){
    		//	//give the 0.7~0.8 prize
    		//	var prizeamount = ((Math.round(Math.random()*100))/1000)+0.7;
    		//	tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	//}else if(prizeweight < (99)){
        	//	//give the 0.8~0.9 prize
        	//	var prizeamount = ((Math.round(Math.random()*100))/1000)+0.8;
        	//	tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
        	//}else{
    		//	//give the 0.9~1 prize
    		//	var prizeamount = ((Math.round(Math.random()*100))/1000)+0.9;
    		//	tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
    		//}
            //return prizeamount;
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