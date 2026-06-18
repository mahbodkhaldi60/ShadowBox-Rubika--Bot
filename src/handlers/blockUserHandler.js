const { User } = require("../../models.js");
const { sendSmartMessage } = require("../services/rubikaApi.service");

async function blockUSerHandler({ senderId, chatId }) {
    try {
        const currentUser = await User.findOne({ rubikaId: senderId }).lean();

        if (!currentUser) {
            await sendSmartMessage(
                chatId,
                "کاربر شما پیدا نشد 😕\nلطفاً دوباره /start را بزن."
            );
            return { nextState: "NORMAL" };
        }

        const blockedIds = Array.isArray(currentUser.blockedUsers)
            ? currentUser.blockedUsers
            : [];

        if (blockedIds.length === 0) {
            await sendSmartMessage(
                chatId,
                "هیچکس تو لیست سیاهت نیست 🕊️✨\nکسی رو بلاک نکردی."
            );
            return { nextState: "NORMAL" };
        }

        const inbox = Array.isArray(currentUser.inbox)
            ? currentUser.inbox
            : [];
            

        let messageText = "لیست سیاه شما 🚫:\n\n";

        blockedIds.forEach((blockedId, index) => {
            const inboxItem = inbox.find(
                item => String(item.rubikaId) === String(blockedId)
            );

            const aliasName = inboxItem?.idcard;

            messageText += `user${index + 1} 👤: /${aliasName}\n`;
        });

        messageText +=
            "\n💡 برای دسترسی به تنظیمات بیشتر، روی هرکدام که می‌خواهی کلیک کن.";

        await sendSmartMessage(chatId, messageText);

        return { nextState: "NORMAL" };
    } catch (error) {
        console.error("blockUSerHandler error:", error);

        await sendSmartMessage(
            chatId,
            "یه مشکلی پیش اومد 😅\nدوباره امتحان کن."
        );

        return { nextState: "NORMAL" };
    }
}

module.exports = {
    blockUSerHandler
};
