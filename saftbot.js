"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();
const PORT = 80; 

//var http = require('http');

var admins = [];

var currentDispatcher = null;

var volume = 1.0;

var lineReader = require("readline").createInterface({
	input: require("fs").createReadStream("admins.txt")
});

lineReader.on("line", function (line) {
    admins.push(line);
});

/*
//USELESS HTTP STUFF
var server = http.createServer(handleRequest);

//USELESS HTTP STUFF
server.listen(PORT, function(){
    //console.log("Server listening on: http://localhost:%s", PORT);
});

//USELESS HTTP STUFF
function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}
*/

//"SETTINGS": (TOO LAZY TO MAKE A PROPER TXT READER):
var UseOriginalCmds = false;
var funnyMeme = true;
var EnableAdmins = true;
//if admins is false, this is if normal users can use admin CMDs
var AllowAdminCmds = true;

function isAdmin(name)
{
    if (! EnableAdmins)
    {
        return AllowAdminCmds;
    }

	return admins.indexOf(name) > -1;
}

function saveAdmins()
{
	var fs = require("fs");
	
	fs.writeFile("admins.txt", admins.join("\r\n"));
}

client.on('ready', () => {
	console.log('I am ready!');

	for (var key in client.voice.connections)
    {
		if (client.voice.connections[key] != null)
		{
			client.voice.connections[key].disconnect();
		}
	}
});

client.on('message', message => {
	if (message.content.startsWith("!") && message.member.user.username != "Saft Bot" && UseOriginalCmds)
	{
		var splitmessage = message.content.split(" ");
		
		if (splitmessage[0] == "!ping")
		{
			message.channel.sendMessage("Pong!");
		}
		
		if (splitmessage[0] == "!say" && splitmessage.length > 1 && isAdmin(message.member.user.username))
		{
			message.delete();
			
			message.channel.sendMessage(splitmessage.slice(1, splitmessage.length).join(" "));
		}
		
		if (splitmessage[0] == "!addadmin" && splitmessage.length > 1 && isAdmin(message.member.user.username))
		{
			var target = splitmessage.slice(1, splitmessage.length).join(" ");
			
			if (isAdmin(target))
			{
				message.channel.sendMessage("**" + target + "** is already admin!");
				return;
			}
			
			message.channel.sendMessage("**" + target + "** is now admin!");
			
			admins.push(target);
			
			saveAdmins();
		}
		
		if (splitmessage[0] == "!removeadmin" && splitmessage.length > 1 && isAdmin(message.member.user.username))
		{
			var target = splitmessage.slice(1, splitmessage.length).join(" ");
			
			if (!isAdmin(target))
			{
				message.channel.sendMessage("**" + target + "** is not an admin!");
				return;
			}
			
			message.channel.sendMessage("**" + target + "** is no longer admin!");
			
			var index = admins.indexOf(target);
			
			if (index > -1)
			{
				admins.splice(index, 1);
			}
			
			saveAdmins();
		}
		
		if (splitmessage[0] == "!johncena")
		{
			if (message.member.voiceChannel == null)
			{
				message.channel.sendMessage("Error! Please join a voice channel!");
				return;
			}
			
			message.member.voiceChannel.join().then(connection => 
			{
				var dispatcher = connection.playFile("johncena.mp3");
				
				currentDispatcher = dispatcher;
				
				dispatcher.setVolume(volume);
				
				dispatcher.on("end", () => 
				{
					connection.disconnect();
					
					currentDispatcher = null;
				});
			});
			
			message.channel.sendMessage("Now playing **JOHN CENA**!");
		}
		
		if (splitmessage[0] == "!iplaypokemongo")
		{
			if (message.member.voiceChannel == null)
			{
				message.channel.sendMessage("Error! Please join a voice channel!");
				return;
			}
			
			message.member.voiceChannel.join().then(connection => 
			{
				var dispatcher = connection.playFile("pokemongosong.mp3");
				
				currentDispatcher = dispatcher;
				
				dispatcher.setVolume(volume);
				
				dispatcher.on("end", () => 
				{
					connection.disconnect();
					
					currentDispatcher = null;
				});
			});
			
			message.channel.sendMessage("Now playing **Pokemon Go Song (FOR KIDS)**!");
		}
		
		if (splitmessage[0] == "!youtube")
		{
			message.channel.sendMessage("!youtube is currently disabled!");
			return;
			
			if (message.member.voiceChannel == null)
			{
				message.channel.sendMessage("Error! Please join a voice channel!");
				return;
			}
			
			var link = splitmessage[1];
			
			var ytstream = require("youtube-audio-stream");
			
			message.member.voiceChannel.join().then(connection => 
			{
				var dispatcher = connection.playStream(ytstream(link));
				
				currentDispatcher = dispatcher;
				
				dispatcher.setVolume(volume);
				
				dispatcher.on("end", () => 
				{
					connection.disconnect();
					
					currentDispatcher = null;
				});
			});
			
			message.channel.sendMessage("Now playing **" + link +"**!");
		}
		
		if (splitmessage[0] == "!kill")
		{
			var target = splitmessage.slice(1, splitmessage.length).join(" ");
			
			message.delete();
			
			message.channel.sendMessage("**" + message.member.user.username + "** killed **" + target + "**!");
		}
		
		if (splitmessage[0] == "!setvolume")
		{
			var value = parseFloat(splitmessage[1]);
			
			if (value == "NaN" || value < 0)
			{
				message.channel.sendMessage("That's not a valid number!");
				return;
			}
			
			volume = value;
			
			if (currentDispatcher != null)
			{
				currentDispatcher.setVolume(volume);
			}
			
			message.channel.sendMessage("Volume was set to " + value);
		}
		
		if (splitmessage[0] == "!stop")
		{
			if (currentDispatcher != null)
			{
				currentDispatcher.end();
			}
			
			currentDispatcher = null;
			
			message.channel.sendMessage("All sounds were stopped!");
		}
		
		if (splitmessage[0] == "!commands")
		{
			message.channel.sendMessage("Commands: \n\
			!kill [target]     - Kill somebody \n\
			!pokemongosong     - Play the Pokemon Go song \n\
			!johncena          - Play the John Cena theme \n\
			!youtube [link]    - Play a Youtube video \n\
			!setvolume [value] - Set volume for sounds");
		}
	}
	

	if (message.content.startsWith("§") && message.member.user.username != "Saft Bot" && isAdmin(message.member.user.username)) {
	    splitmessage = message.content.split(" ");
	    var command = splitmessage[0].toLowerCase();
	    var args = splitmessage.slice(1, splitmessage.length).join(" ");

	    if (command == "§test") {
	        message.channel.sendMessage("SUCCESS!");
	    }

	    if (command == "§getname") {
	        message.channel.sendMessage(message.member.user.username);
	    }

	    if (command == "§isonly") {
	        if (message.member.voiceChannel == null) {
	            message.channel.sendMessage("Only- Is only Error, y u heff to not join voicechannel");
	            return;
	        }

	        //message.channel.sendMessage(splitmessage[1] + "? I don't get it");

	        if (args == null || args == "game" || args == "gem") {
	            message.member.voiceChannel.join().then(connection => {
	                var dispatcher = connection.playFile("mad(full).mp3");

	                currentDispatcher = dispatcher;

	                dispatcher.setVolume(volume);

	                dispatcher.on("end", () => {
	                    connection.disconnect();

	                    currentDispatcher = null;
	                });
	            });
	            message.channel.sendMessage("Only- Is only gem, y u heff to be mad");
	        }
	        else {
	            message.channel.sendMessage("This function is still WIP, sorry");
	            message.member.voiceChannel.join().then(connection => {
	                var dispatcher = connection.playFile("mad(1).mp3");

	                currentDispatcher = dispatcher;

	                dispatcher.setVolume(volume);

	                dispatcher.on("end", () => {
	                    /* var msg = new SpeechSynthesisUtterance(args);

	                    var dispatcher = null;

	                    var msg = new SpeechSynthesisUtterance('Hello World');
	                    window.speechSynthesis.speak(msg);

	                    currentDispatcher = dispatcher;

	                    dispatcher.setVolume(volume);

	                    dispatcher.on("end", () => { */
	                        var dispatcher = connection.playFile("mad(2).mp3");

	                        currentDispatcher = dispatcher;

	                        dispatcher.setVolume(volume);

	                        dispatcher.on("end", () => {
	                            connection.disconnect();

	                            currentDispatcher = null;
	                        });
	                    });
	                });
	            //});
	            message.channel.sendMessage("this is test");
	            message.channel.sendMessage("only- It's only "+args+" y u heff to be mad?");

	        }
	    }

	    if (command == "§square") {
	        message.delete();
	        var toSend = args;
	        var a = 1;
	        while (a < args.length)
	        {
	            toSend += "\n" + args[a];
	            a += 1;
	        }
	        message.channel.sendMessage(toSend);
	    }

        if (command == "§mute"){}
	}
	
});

client.login('MjQ1OTU0Njc3MjE5MjYyNDY0.CwTmqg.09WOoLgT6IjMpP4TqsTr32Tb8fY');
