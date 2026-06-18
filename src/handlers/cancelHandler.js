
const { sendSmartMessage, } = require("../services/rubikaApi.service");

const { MAIN_KEYPAD } = require("../keybord/AllKeybord");


async function cancelHandler({ user, chatId }) {

    user.targetId = null;

    await sendSmartMessage(chatId, " ارسال پیام لغو شد! برگشتیم به منوی اصلی🚫", { keypad: MAIN_KEYPAD });
    return { nextState: "NORMAL" };
}

module.exports = {
    cancelHandler
}