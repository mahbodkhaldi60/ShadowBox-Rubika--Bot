
const { rubikaRequest } = require("./rubikaApi.service")

async function setCommands() {

    return rubikaRequest("setCommands", {
        "bot_commands": [
            {
                "command": "start",
                "description": "شروع ربات 🚀"
            },
            {
                "command": "create_link",
                "description": "ساخت لینک 🔗"
            },
            {
                "command": "hidden_chat",
                "description": "چت با ناشناس💬"
            },
            {
                "command": "blocked_users",
                "description": "لیست بلاکی ها ❌"
            },
            {
                "command": "text_box",
                "description": "تکست باکس🖊️"
            },
            {
                "command": "balance",
                "description": "موجودی پیام 💳"
            }
        ]

    })
}

module.exports = {
    setCommands
}





