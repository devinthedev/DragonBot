//DragonBot
//In Progress jakedageek
//latest version 0.1.1 8-8-13

// CoinChat bot

var io = require('socket.io-client');
socket = io.connect("https://coinchat.org", {secure: true reconnect: false});

var username = "DragonBot";
var outputBuffer = [];
var statichealth = 100;
var dragonhealth = 94;
var hero = ".";
var balance = 0;
var i = 0;
socket.on('connect', function(){
		//Your session key (aka API key)
		//Get this from your browser's cookies.
    socket.emit('login', {session: ""});
    socket.on('loggedin', function(data){
    	username = data.username;
    	setTimeout(function(){
			socket.emit("getcolors", {});
			socket.emit('joinroom', {join: 'dragonbot'});
            socket.emit("getbalance", {});
            socket.on('balance', function(data){
                if(typeof data.balance !== 'undefined'){
                    balance = data.balance;
                }
            });
			socket.on('chat', function(data){ //the program loops this bracket
				if (data.message === "!rules" && data.room === "dragonbot") {
                    outputBuffer.push({room: data.room, color: "000", message: data.user + ": Slay the dragon! The dragon initially has 100 health. Each swing reduces the health by a random amount between 1~50! Each swing is exactly 0.25 mBTC. When you kill the dragon, you can get a prize of anywhere from 0.25~1.63 mBTC! Damage rolls over; if you swing a 50 on a dragon with 25 health, the next dragon will only have 75 health! Be careful of kill steals! You can tip any multiple of 0.25 and it will swing accordingly."});
        		}
        		if (data.message === "!balance" && data.room === "dragonbot") {
                    socket.emit("getbalance", {});
                    socket.emit("getbalance", {});
                    socket.emit("getbalance", {});
                    socket.emit("getbalance", {});
                    socket.emit("getbalance", {});
					outputBuffer.push({room: data.room, color: "000", message: data.user + ": current balance of bot = " + balance});
        		}
        		if (data.message === "!health" && data.room === "dragonbot") {
        			outputBuffer.push({room: data.room, color: "000", message: data.user + ": the current health of the dragon is  " + dragonhealth + "!"});
        		}
                if (data.message === "!commands" && data.room === "dragonbot") {
                    outputBuffer.push({room: data.room, color: "000", message: data.user + ": !rules, !nom, !health, !commands"});
                }
                if(contains(data.message, ["<span class='label label-success'>has tipped " + username, "donation"])){
	            outputBuffer.push({room: data.room, color: "000", message: "Thank you for the tip, " + data.user + "!"})
           	}
                if (data.message === "!nom" && data.room === "dragonbot") {
                    outputBuffer.push({room: data.room, color: "000", message: "/me noms " + data.user});
                }
                if (data.message === "!disconnect" && data.room === "dragonbot") {
                    socket.disconnect();
                    exit();
                }
				if(contains(data.message, ["<span class='label label-success'>has tipped " + username])){
                    var stringamount = data.message.split("<span class='label label-success'>has tipped ")[1].split(" ")[1];
                    var amount = Number(stringamount);
					var player = data.user;
					if(amount % 0.25 === 0){ //is it a mutliple of 0.25?
                        var numtip = amount / 0.25; //yes. how many swings?
                        for (var i = 0;i < numtip;i++){ //loop the swing mech "numptip" times.
                            var swing = Math.ceil((Math.random()*100)/2); //random number from 1 to 50
                            console.log(swing);
                            dragonhealth = dragonhealth - swing;
                            if(dragonhealth <= 0){ //was the dragon killed?
                                dragonhealth = statichealth + dragonhealth; //reset dragon's health
                                outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has swung and dealt " + swing + " damage, killing the dragon!"}); //notify
                                prize(data.user); //give prize
                            }else{
                                //state current health if dragon not killed
                                outputBuffer.push({room: "dragonbot", color: "000", message: data.user + " has swung and dealt " + swing + " damage, and the dragon now has " + dragonhealth + " health left!"});
                                socket.emit("getbalance", {});
                            }    
                        }
					}else{ //not a multiple of 0.25
						var refamount = amount * 0.98;
                        tip("dragonbot", data.user, refamount, "refund! A tip needs to be a multiple of 0.25.")
                        socket.emit("balance", {});
					}
				}
			});
		}, 1500);
    	setInterval(function(){
    		//CoinChat has a 550ms anti spam prevention. You can't send a chat message more than once every 550ms.
            if(outputBuffer.length > 0){ 
                if(outputBuffer[0].tipObj){ 
                    socket.emit("tip", outputBuffer.splice(0,1)[0].tipObj); 
                } else{ 
                    var chat = outputBuffer.splice(0,1)[0]; 
                    socket.emit("chat", {room: chat.room, message: chat.message, color: "000"}); 
                } 
            } 
    		//if(tipBuffer.length>0){
            //   var tip = tipBuffer.splice(0,1)[0];
            //    socket.emit("tip", {room: tip.room, message: tip.message, user: tip.user, tip: tip.tip});
            //}else if(outputBuffer.length > 0){
            //    var chat = outputBuffer.splice(0,1)[0];
            //    socket.emit("chat", {room: chat.room, message: chat.message, color: "000"});
            //}
    	}, 600);
        function tip(roomName, userName, amount, note){ 
            outputBuffer.push({tipObj: {user: userName, room: roomName, tip: amount, message: note}
            }); 
        }
        function prize(prizeuser){
            var prizeamount = (Math.random() * 1.38) + 0.25;
            tip("dragonbot", prizeuser, prizeamount, "DragonBot Prize!");
            //tipBuffer.push({user: prizeuser, room: "dragonbot", tip: prizeamount, message: "DragonBot Prize"});
            socket.emit("getbalance", {});
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
