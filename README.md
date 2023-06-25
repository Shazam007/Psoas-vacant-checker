# Psoas-vacant-checker
Vacant checker for [PSOAS](https://psoas.fi/en/apartments) apartment 

## Dependencies
- Selenium and chrome driver used for the automation
- [Send Grid](https://app.sendgrid.com) used as the email server (free 100 email per day)
- pm2 used as the node service manager

## How to install - ubuntu approach
1. Spinup the instance `sudo su` and execute following commands and steps as root user
2. Install nodejs 18 using nvm [Installation guide for ubuntu 20](https://tecadmin.net/how-to-install-nvm-on-ubuntu-20-04/)
3. Install google-chrome-stable, chromedriver and Xvfb (for selenium automation) - [Complete guide here](https://medium.com/@muhammetenginar/selenium-nodejs-on-ubuntu-vm-18-04-chrome-78-x-bbbcb30d674e)
4. Clone the repository (stable code is on master branch)
5. Create the .env file and add the secrets.
`MAIL_SERVER_API_KEY = "send grid API key here"
SENDER_EMAIL = sender's email
RECEIVER_EMAIL = receiver's email`
6. `npm install`
7. install pm2 as the service manager - [Stackoverflow issue and guide](https://stackoverflow.com/questions/38185590/pm2-command-not-found)
8. initialize the display - `Xvfb :1 -screen 0 1024x768x24 & export DISPLAY=:1`
9. `start the script pm2 start script.js`

