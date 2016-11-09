"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();

var admins = [];

var currentDispatcher = null;

var volume = 1.0;

var lineReader = require("readline").createInterface({
	input: require("fs").createReadStream("admins.txt")
});

lineReader.on("line", function (line) {
	admins.push(line);
});

function isAdmin(name)
{
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
	if (message.content.startsWith("!"))
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
});

client.login('MjQ1OTU0Njc3MjE5MjYyNDY0.CwTmqg.09WOoLgT6IjMpP4TqsTr32Tb8fY');