"use strict";

const Discord = require('discord.js');
const client = new Discord.Client();
const PORT = 80; 

var admins = [];
var muted = [];

var currentDispatcher = null;

var volume = 1.0;

var lineReader = require("readline").createInterface(
{
	input: require("fs").createReadStream("admins.txt")
});

lineReader.on("line", function (line) 
{
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


client.on('ready', () => 
{
	console.log('I am ready!');

	for (var key in client.voice.connections)
    {
		if (client.voice.connections[key] != null)
		{
			client.voice.connections[key].disconnect();
		}
	}
});

client.on('message', message => 
{
    var a = 0;
    for (a in muted) {
        if (muted[a] == message.member.user.username)
        {
            message.delete();
            return;
        }
    }

    if (message.content.startsWith("!") && message.member.user.username != "Saft Bot")
    {
        var splitmessage = message.content.split(" ");
        var command = splitmessage[0].toLowerCase();
        var args = splitmessage.slice(1, splitmessage.length).join(" ");
		
        if (isAdmin(message.member.user.username) && splitmessage.length > 1)
        {
            if (command == "!say")
            {
                message.delete();
                message.channel.sendMessage(args);
            }

            if (command == "!square")
            {
                var toSend = args;
                var a = 1;

                message.delete();

                while (a < args.length) {
                    toSend += "\n" + args[a];
                    a += 1;
                }

                message.channel.sendMessage(toSend);
            }

            if (command == "!addadmin")
            {
                if (isAdmin(args)) {
                    message.channel.sendMessage("**" + args + "** is already admin!");
                    return;
                }

                message.channel.sendMessage("**" + args + "** is now admin!");
                admins.push(args);
                saveAdmins();
            }

            if (command == "!removeadmin")
            {
                if (!isAdmin(args)) {
                    message.channel.sendMessage("**" + args + "** is not an admin!");
                    return;
                }

            message.channel.sendMessage("**" + args + "** is no longer admin!");

            var index = admins.indexOf(args);

                if (index > -1) {
                    admins.splice(index, 1);
                }

                saveAdmins();
            }

            if (command == "!mute")
            {
                if (muted.indexOf(args) > -1) {
                    message.channel.sendMessage("**" + args + "** is already muted!");
                    return;
                }

                if (args == "Saft Bot") {
                    message.channel.sendMessage("You can't mute me!");
                    return;
                }

                message.channel.sendMessage("**" + args + "** is now muted!");
                muted.push(args);
            }

            if (command == "!unmute")
            {
                if (muted.indexOf(args) < 0) {
                    message.channel.sendMessage("**" + args + "** isn't muted!");
                    return;
                }

                muted.splice(muted.indexOf(args), 1);
                message.channel.sendMessage("**" + args + "** is no longer muted!")
            }

            if (command == "!purge")
            {
                var int = parseInt(args, 10);

                if (int < 1 || int > 200)
                {
                    message.channel.sendMessage("Die Zahl ist ungueltig");
                    return;
                }

                message.channel.bulkDelete(int);
                message.channel.sendMessage(int, " Messages were deleted");
            }
        }

        if (command == "!ping")
        {
            message.channel.sendMessage("Pong!");
        }

        if (command == "!johncena")
        {
                if (message.member.voiceChannel == null) {
                    message.channel.sendMessage("Error! Please join a voice channel!");
                    return;
                }

                message.member.voiceChannel.join().then(connection => {
                    var dispatcher = connection.playFile("johncena.mp3");

                    currentDispatcher = dispatcher;
                    dispatcher.setVolume(volume);

                    dispatcher.on("end", () => {
                        connection.disconnect();
                        currentDispatcher = null;
                    });
                });

                message.channel.sendMessage("Now playing **JOHN CENA**!");
            }

        if (command == "!iplaypokemongo")
        {
                if (message.member.voiceChannel == null) {
                    message.channel.sendMessage("Error! Please join a voice channel!");
                    return;
                }

                message.member.voiceChannel.join().then(connection => {
                    var dispatcher = connection.playFile("pokemongosong.mp3");

                    currentDispatcher = dispatcher;
                    dispatcher.setVolume(volume);

                    dispatcher.on("end", () => {
                        connection.disconnect();
                        currentDispatcher = null;
                    });
                });

                message.channel.sendMessage("Now playing **Pokemon Go Song (FOR KIDS)**!");
            }

        /*
        if (command == "!youtube")
        {
                message.channel.sendMessage("!youtube is currently disabled!");
                return;

                if (message.member.voiceChannel == null) {
                    message.channel.sendMessage("Error! Please join a voice channel!");
                    return;
                }

                var link = splitmessage[1];

                var ytstream = require("youtube-audio-stream");

                message.member.voiceChannel.join().then(connection => {
                    var dispatcher = connection.playStream(ytstream(link));

                    currentDispatcher = dispatcher;

                    dispatcher.setVolume(volume);

                    dispatcher.on("end", () => {
                        connection.disconnect();

                        currentDispatcher = null;
                    });
                });

                message.channel.sendMessage("Now playing **" + link + "**!");
            }
        */

        /*
        if (command == "!kill")
        {
                message.delete();
                message.channel.sendMessage("**" + message.member.user.username + "** killed **" + args + "**!");
            }
        */

        if (command == "!setvolume")
        {
                var value = parseFloat(splitmessage[1]);

                if (value == "NaN" || value < 0) {
                    message.channel.sendMessage("That's not a valid number!");
                    return;
                }

                volume = value;

                if (currentDispatcher != null) {
                    currentDispatcher.setVolume(volume);
                }

                message.channel.sendMessage("Volume was set to " + value);
            }

        if (command == "!stop")
        {
            if (currentDispatcher != null) {
                currentDispatcher.end();
            }

            currentDispatcher = null;

            message.channel.sendMessage("All sounds were stopped!");
            }

        if (command == "!commands")
        {
            message.channel.sendMessage("Commands: \n\
			**!kill [target]\n**- Kill somebody \n\
			**!pokemongosong\n**- Play the Pokemon Go song \n\
            **!johncena**\n- Play the John Cena theme \n\ "
			//+"**!youtube [link]**\n- :spindieplates: [BROKEN] \n\"
			+"**!setvolume [value]**\n- Set volume for sounds \n\
            **!getname**\n- Return your name \n\
            **!isonly [noun]**\n- Play the meme [BROKEN] \n\
            **!square [message]**\n- Annoy people \n\
            **!mute [target]**\n- Shut someone up [BROKEN] \n\
            **!say [message]**\n- Print a message \n\
            **!addadmin [target]**\n- Add someone as Admin \n\
            **!removeadmin [target]**\nRemove an admin \n\
            **!listadmins**\n- lists all admins \n\
            **!mute [target]**\n- mute someone \n\
            **!unmute [target]**\n- unmute someone \n\
            **!purge [number]**\n- get rid of messages "
            );
        }
	
        if (command == "!getname")
        {
            message.channel.sendMessage(message.member.user.username);
        }

        if (command == "!isonly") 
        {
            if (message.member.voiceChannel == null)
            {
                message.channel.sendMessage("Only- Is only Error, y u heff to not join voicechannel");
                return;
            }

            if (args == null || args == "game" || args == "gem") 
            {
                message.member.voiceChannel.join().then(connection => 
                {
                    var dispatcher = connection.playFile("mad(full).mp3");

                    currentDispatcher = dispatcher;

                    dispatcher.setVolume(volume);

                    dispatcher.on("end", () =>
                    {
                        connection.disconnect();

                        currentDispatcher = null;
                    });
                });

                message.channel.sendMessage("Only- Is only gem, y u heff to be mad");
            }
            else 
            {
                message.channel.sendMessage("This function is still WIP, sorry");
                message.member.voiceChannel.join().then(connection => 
                {
                    var dispatcher = connection.playFile("mad(1).mp3");

                    currentDispatcher = dispatcher;

                    dispatcher.setVolume(volume);

                    dispatcher.on("end", () => 
                    {
                        /* 
                                 TTS STUFF GOES HERE
                            */
                        var dispatcher = connection.playFile("mad(2).mp3");

                        currentDispatcher = dispatcher;

                        dispatcher.setVolume(volume);

                        dispatcher.on("end", () => 
                        {
                            connection.disconnect();

                            currentDispatcher = null;
                        });
                    });
                });
	            
                message.channel.sendMessage("only- It's only "+args+" y u heff to be mad?");
            }
        }
        
        if (command == "!listadmins")
        {
        message.delete;
        message.channel.sendMessage(admins);
    	}
	
    }

});

client.login('MjQ1OTU0Njc3MjE5MjYyNDY0.CwTmqg.09WOoLgT6IjMpP4TqsTr32Tb8fY');
