# IRC CHAT APP

## DESCRIPTION
In this project we created a chat IRC with nodejs in back, react js for the front and socket.io for the communication.

### Commands:
* /nick [username]: to change your current username.

* /list[string]:list the available channels from the server. [string] is optional; use it if you want to get the channels those whose name contains the string.

* /create [channel]: create a channel with the specified name.

* /delete [channel]: delete the channel with the specified name.

* /join [channel]: join the specified channel.

* /quit [channel]: quit the specified channel.

* /users: list the users currently in the channel

* /msg [nickname] [message]: send a private message to the specified nickname.

* message: send message the all the users on the channel.

## INSTALLATION AND RUN
### node
You just have to install node on your machine.

### Server
* Go to server folder and install of the dependencies with this command: `npm install .`
* When installation is finished, run this command: `node server.js`

### Client
* Go to Client folder and install of the dependencies with: `npm install .`
* When installation is finished, run this command: `npm start`

### --------------------- ENJOY ---------------------