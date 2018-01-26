
const LgGame = require("./LgGame");
delete require.cache[require.resolve("./LgGame")];
var games = [];

function compareUser(user,server){
	var gm = server.members.array();
	for(var i = 0; i < gm.length; i++){
		if(gm[i].id == user.id){
			return gm[i];
		}
	}
}

exports.commands = [
	"lgJoin",
	"lgCreate",
	"lgGames",
	"lgStatus",
	"lgCancel"
]

exports.lgCancel = {
	usage: "<nom de la partie>",
	description: "Supprimer une partie en attente",
	args: [{type: "string", optional: false}],
	process: function(bot,msg,suffix){
		try{
			for(var i = 0; i < games.length; i++){
				var game = games[i];
				if(suffix == game.titre){
					if(msg.author.id != game.createur.id){
						msg.reply("Seul le createur de la partie peux supprimer cette partie!")
						return false;
					}
					
					games.splice(i,1);
					msg.reply("La partie " + game.titre + " à été supprimée.");
					return true;
				}
			}
			msg.reply("Il n'y a aucune partie de ce nom!");
		}catch(e){
			console.log(e.stack);
		}
	}
}

exports.lgStatus = {
	usage : "<nom de la partie>",
	description: "voir le statut d'une partie",
	args: [{type: "string", optional: false}],
	process: function(bot,msg,suffix){
		try{
			for(var i = 0; i < games.length; i++){
				var game = games[i];
				if(suffix == game.titre){
					var batch;
					batch = "\nEtat de la partie : " + game.state + ".";
					batch += "\nJoueurs : ";
					for(var j = 0; j < game.players.length; j++){
						var player = game.players[j];
						batch += "\n" + player.toString();
					}
				}
			}
			msg.reply(batch);
		}catch(e){
			console.log(e.stack);
		}
	}
}

exports.lgJoin = {
	usage : "<nom de la partie>",
	description: "Rejoindre une partie de loup-garou",
	args: [{type: "string", optional: false}],
	process: function(bot,msg,suffix){
		try{
			for(var i = 0; i < games.length; i++){
				var game = games[i];
				var player = msg.author;
				if(suffix == game.titre){
					if(game.checkPlayers(player)){
						msg.reply("Vous êtes deja dans cette partie !");
						return false;
					}
					if(game.addPlayer(compareUser(player,msg.guild))){
						msg.reply("Vous avez rejoint la partie " + game.titre);
					}else{
						msg.reply("Il n'y a plus assez de place dans cette partie");
					}
				}
			}
		}catch(e){
			console.log(e.stack);
		}
	}
}

exports.lgCreate = {
	usage : "<nom de la partie> <nombre de joueur>",
	description: "Creer une partie de loup-garou",
	args : [
				{type: "string", optional: false},
				{type: "number", optional: false}
			],
	process: function(bot,msg,suffix){


		var game = new LgGame(suffix[0],suffix[1],bot,msg,compareUser(msg.author,msg.guild));
		try{
			games.push(game);
			game.makePerms();
			game.addPlayer(msg.author.toString());
		}catch(e){
			console.log(e.stack);
		}
	}
}

exports.lgGames = {
	usage: "",
	description : "montre les parties de loup-garou",
	process: function(bot,msg,suffix){
		try{
			var info = "";
			if(games.length > 0){
				for(var i = 0; i < games.length; i++){
					var game = games[i];
					if(game.players.length == game.maxPlayers){
						info += "\nsalon complet " + game.titre + " " + game.players.length + "/" + game.maxPlayers + " joueurs dans le salon";
					}else{
						info += "\nsalon incomplet " + game.titre + " " + game.players.length + "/" + game.maxPlayers + " joueurs dans le salon";
					}
				}
			}else{
				info += "\nIl n'y aucune partie en cours pour le moment";
			}
			msg.reply(info);
		}catch(e){
			console.log(e.stack);
		}
	}
}