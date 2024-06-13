# Prerequisites
## Setup env
Ensure that Node.js and npm (Node Package Manager) are installed on your system. You can download them from Node.js official website https://nodejs.org/en

`node -v`\
`npm -v`\
`npm install discord.js`\
`npm install dotenv`


## Create a discord bot:
Go to the Discord Developer Portal.

Click on "New Application" and give your bot a name.

Go to the "Bot" section, click on "Add Bot," and confirm.

Under the "Bot" settings, you'll find the "Token" which you'll need later.

Ensure the bot has the necessary permissions to manage messages and monitor member updates.

## Set up the .env file
Create a .env file in the root directory of your project and add the following configurations:
```
DISCORD_TOKEN=VITALIK_BUTERIN
IMPORTANT_ROLES=Chief Driver, Mod Driver
ADMIN_CHANNEL=admin-notifications
```
Replace `VITALIK_BUTERIN` with the actual token from the Discord Developer Portal. Update the `IMPORTANT_ROLES`, and `ADMIN_CHANNEL` accordingly.




