const { Client, RichEmbed } = require('discord.js');
const client = new Client();

const iotaLibrary = require('@iota/core')
const iota = iotaLibrary.composeAPI({
    provider: 'https://nodes.tanglebay.org'
})
const converter = require("@iota/converter");

let zmq = require('zeromq')
let sock = zmq.socket('sub')

const address = 'MPGXFGIYCINCOGYYQJNCPKVYKRFSK9I9ECUZPIHYX9BBBYDLPOPAWBJYM9TOUARJAUVJSOJPQGPWWYGBWFLTNVBFDC'
sock.subscribe(address)

// Connect to the devnet node's ZMQ port
//sock.connect('tcp://zmq.devnet.iota.org:5556')
sock.connect('tcp://magikarp.node.tanglebay.org:6665')

const channelID_general = '577244361222520853'

require('dotenv').config() // Loads .env

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {

    if (message.author.bot) return;

    const config = {
        prefix: '!'
    }
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

    const command = args.shift().toLowerCase();
    let arg = args[0];

    if (message.content.indexOf(config.prefix) !== 0) return;

    switch (command) {
        case 'ping':
            message.reply('Pong!');
            break;
    }

})


sock.on('message', msg => {
    const data = msg.toString().split(' ') // Split to get topic & data
    switch (
    data[0] // Use index 0 to match topic
    ) {
        case address:
            iota.getTransactionObjects([data[1]])
                .then(transactions => {
                    client.channels.get(channelID_general).send('Thanks! Donation has been received. :heart:');
                    let title = "Donated: " + transactions[0].value + " IOTA";
                    let description = converter.trytesToAscii(transactions[0].signatureMessageFragment + "9");
                    let embed = new RichEmbed()
                        // Set the title of the field
                        .setTitle(title)
                        // Set the color of the embed
                        .setColor(0x00b7c5)
                        // Set the main content of the embed
                        .setDescription(description);
                    client.channels.get(channelID_general).send(embed)
                })
                .catch(err => {
                    // handle errors
                    console.log("err: " + data[1], err)
                })
            
            break
    }
})

client.login(process.env.DISCOD_BOT_KEY);
