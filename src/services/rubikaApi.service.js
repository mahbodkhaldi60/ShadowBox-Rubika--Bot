

const API_URL = require("../config/rubika.js")


async function rubikaRequest(method, paylod = {}) {

    try {

        const response = await fetch(`${API_URL}/${method}`, {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(paylod)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error(`rubika ERROR :  ${method} - ${response.status}`)
            console.error(errorText)
            return null
        }
        return await response.json()
    }
    catch (error) {
        console.error(` rubika request failed in ${method}:`, error);
        return null;
    }

}
async function sendSmartMessage(chatId, text, options = {}, notf = false) {


    let bodyData = {
        chat_id: chatId,
        text: text,
        disable_notification: true
    };

    if (options.replyToMessageId) {
        bodyData.reply_to_message_id = options.replyToMessageId;
    }
    if (options.inlineKeypad) {
        bodyData.inline_keypad = options.inlineKeypad;
    }

    if (options.keypad) {
        bodyData.chat_keypad_type = "New";
        bodyData.chat_keypad = options.keypad;
    }

    else if (options.removeKeypad) {
        bodyData.chat_keypad_type = "Remove";
    }

    return rubikaRequest("sendMessage", bodyData)
}
async function sendSmartFile(chatId, fileId, captionText = "", options = {}) {
    const payload = {
        "chat_id": chatId,
        "file_id": fileId,
        "text": captionText
    };

    if (options.inlineKeypad) {
        payload.inline_keypad = options.inlineKeypad;
    }

    if (!data || data.status !== "OK") {
        console.error("❌ sendFile error:", data?.status_det || data);
        return null;
    }

    return data;

}

async function getinfo(anyChatId) {
    return rubikaRequest("getChat", {
        chat_id: anyChatId
    })
}
async function getFile(fileId) {
    return rubikaRequest("getFile", { file_id: fileId });
}

async function requestSendFile(fileType) {
    return rubikaRequest("requestSendFile", { type: fileType })
}

async function editMessageKeypad(chatId, messageId, inlineKeypad) {
    return rubikaRequest("editMessageKeypad", {
        chat_id: chatId,
        message_id: messageId,
        inline_keypad: inlineKeypad
    });
}

async function editChatKeypad(chatid) {
    rubikaRequest("editChatKeypad", {
        "chat_id": chatid,
        "chat_keypad_type": "Remove"
    })

}

async function editMessageText(chatId, messageId, text) {
    return rubikaRequest("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: text,
    });
}
async function deleteMessage(chatId, messageId, text) {
    return rubikaRequest("deleteMessage", {
        chat_id: chatId,
        message_id: messageId,
    });
}
async function setEndpoints() {

    await rubikaRequest("updateBotEndpoints", {
        url: "https://shadowbox.liara.run/receiveUpdate",
        type: "ReceiveUpdate"
    })
    await rubikaRequest("updateBotEndpoints", {
        url: "https://shadowbox.liara.run/receiveInlineMessage",
        type: "ReceiveInlineMessage"
    })
    console.log("Endpoints Updated ✅");
}

module.exports = {

    editMessageKeypad,
    editMessageText,
    setEndpoints,
    rubikaRequest,
    sendSmartMessage,
    sendSmartFile,
    getinfo,
    getFile,
    deleteMessage,
    requestSendFile,
    editChatKeypad

} 
