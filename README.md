

# ShadowBox – Rubika Anonymous Chat Bot

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Webhook](https://img.shields.io/badge/Webhook-API-blue)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-yellow)

A powerful **anonymous chat bot for Rubika** that randomly connects users and enables private conversations without revealing identities.

Built with **Node.js**, **MongoDB**, and **Webhook architecture** to support scalable and real‑time messaging.

---

## Overview

ShadowBox allows Rubika users to start anonymous conversations with strangers.  
The bot manages user sessions, matches users randomly, prevents spam, and routes messages securely between participants.

This project demonstrates backend architecture, state management, and real‑time bot systems.

---

## Features

- Anonymous random chat between users
- User list based searching system
- State management for conversation flow
- Anti‑spam protection
- MongoDB database integration
- Webhook‑based message processing
- User session handling
- Scalable bot architecture

---

## Tech Stack

Backend

- Node.js
- JavaScript (ES6)

Database

- MongoDB

Infrastructure

- Webhook API
- REST communication

---

## Bot Preview
<p align="center">
  <img src="src/imag/Bot.png"/>
</p>
 ---

## Demo Video

Watch the bot in action on YouTube:

https://youtube.com/shorts/jrOtMkhdPqg?si=btfdg4sJqQFkumRO


## Installation

Clone the repository

git clone https://github.com/mahbodkhaldi60/shadowbox-rubika-anonymous-bot.git

Navigate into the project

cd shadowbox-rubika-anonymous-bot

Install dependencies

npm install

Create a `.env` file and configure your environment variables.

Run the bot

node app.js

---

## Environment Variables

Example `.env` configuration

BOT_TOKEN=your_rubika_bot_token  
MONGOOSEURL=your_mongodb_connection_string

---

## How It Works

1. User starts the bot in Rubika  
2. The bot stores user information in MongoDB  
3. Users are added to the matching pool  
4. The bot randomly matches users  
5. Messages are forwarded between matched users  
6. Anti‑spam system prevents abuse

---

## Security Features

- Anti‑spam protection
- Session control
- Message filtering
- Database validation
---

## Author

Developed by **Mahbod**

GitHub  
https://github.com/mahbodkhaldi60



