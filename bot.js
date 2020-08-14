const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client();
const config = require("./config.json");

const commands = fs.readdirSync("./commands");
let currency = fs.readFileSync("./storage/currency.txt").toString().split("\n");
let cooldowns = fs.readFileSync("./storage/cooldowns.txt").toString().split("\n");
bot.login(process.env.BOT_TOKEN);

setInterval(function()
{
	fs.writeFileSync("./storage/currency.txt", currency.join("\n"));
	fs.writeFileSync("./storage/cooldowns.txt", cooldowns.join("\n"));

	for(let i = 0; i < cooldowns.length; i++)
	{
		if (cooldowns[i].toString().startsWith("c"))
		{
			let remaining = parseInt(cooldowns[i].slice(1, cooldowns[i].length));
			remaining--;
			cooldowns[i] = `c${remaining}`;

			if (parseInt(cooldowns[i].slice(1, cooldowns[i].length)) < 1)
			{
				cooldowns.splice(i - 1, 2);
			}
		}
	}
}, 1000);

bot.on("ready", async() =>
{
	console.log("Ready");
	bot.user.setActivity(`for ${config.prefix}help`, {"type": "WATCHING"})
})

bot.on("message", async(message) =>
{
	if (!message.content.startsWith(config.prefix) || message.author.bot || message.channel.type === "dm") return;
	let args = message.content.split(" ");
	let cmd = args[0].toLowerCase().slice(config.prefix.length, message.content.length);
	let target;
	if (args[1])
	{
		target = message.guild.members.cache.find(member => member.id === args[1].replace("<@", "").replace(">", ""));
	}
	if (!currency.includes(message.author.id))
	{
		currency.push(message.author.id);
		currency.push(0);
	}
	if (target)
	{
		if (!currency.includes(target.id) && !target.user.bot)
		{
			currency.push(target.id);
			currency.push(0);
		}
	}

	if (commands.includes(`${cmd}.js`))
	{
		eval(fs.readFileSync(`./commands/${cmd}.js`).toString());
	}

})
