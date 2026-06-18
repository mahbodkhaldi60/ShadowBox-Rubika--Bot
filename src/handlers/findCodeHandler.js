const { User } = require("../../models.js");
const { sendSmartMessage } = require("../services/rubikaApi.service");

async function findCodeHandler({ senderId, chatId, text }) {
    const clickedAlias = text.startsWith("/") ? text.substring(1) : text;

    const currentUser = await User.findOne({ rubikaId: senderId });

    if (!currentUser) {
        await sendSmartMessage(chatId, "یک بار دیگه تلاش کنید لطفا ❌");
        return { nextState: "NORMAL" };
    }

    const targetUser = await User.findOne({ idCard: clickedAlias });

    if (!targetUser) {
        await sendSmartMessage(chatId, "همچین کاربری پیدا نشد! 🕵️‍♂️");
        return { nextState: "NORMAL" };
    }

    const inbox = currentUser.inbox || [];

    const isInInbox = inbox.some(item => {
        return String(item.rubikaId) === String(targetUser.rubikaId);
    });

    if (!isInInbox) {
        await sendSmartMessage(chatId, "همچین کاربری تو لیست مخاطب‌های ناشناس شما پیدا نشد! 🕵️‍♂️");
        return { nextState: "NORMAL" };
    }

    const blockedUsers = currentUser.blockedUsers || [];

    const isBlocked = blockedUsers.some(id => {
        return String(id) === String(targetUser.rubikaId);
    });

    if (isBlocked) {
        const buttons = {
            rows: [
                {
                    buttons: [
                        {
                            button_text: "🔓 آنبلاک کردن",
                            id: `unblock_${targetUser.rubikaId}`,
                            type: "Simple"
                        },
                        {
                            button_text: "📩 آخرین پیام ارسالی",
                            id: `lastmsg_${targetUser.rubikaId}`,
                            type: "Simple"
                        }
                    ]
                }
            ]
        };

        await sendSmartMessage(
            chatId,
            "این کاربر در حال حاضر در لیست سیاه شما قرار دارد.\nچیکارش کنم؟",
            { inlineKeypad: buttons }
        );

        return { nextState: "NORMAL" };
    }

    await sendSmartMessage(chatId, "این کاربر که تو لیست سیاهت نیست! الکی بهش تهمت نزن 😅");

    return { nextState: "NORMAL" };
}

module.exports = {
    findCodeHandler
};
