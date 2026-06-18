const { User, Message } = require("../../models.js");
const {
    sendSmartMessage,
    editMessageKeypad,
    deleteMessage,
} = require("../services/rubikaApi.service");

const { randomData } = require("../../RandomMessage.js");
const {
    CANCEL_KEYPAD,
    getActionInlineKeyboard
} = require("../keybord/AllKeybord");

async function hiddenActionHandler({
    inlineButtonId,
    clickerChatId,
    previousState,
    rubikaKeyPadMessageId,
    user,
    senderId
}) {
    if (!inlineButtonId || typeof inlineButtonId !== "string") {
        return { nextState: previousState || user.state };
    }

    const [action, targetRubikaId, targetMessageId] = inlineButtonId.split("_");

    console.log(`action: ${action}
targetRubikaId: ${targetRubikaId}
targetMessageId: ${targetMessageId}`);

    if (!action || !targetRubikaId) {
        console.log("دیتا ناقصه داداش! 😅");
        return { nextState: previousState || user.state };
    }

    switch (action) {


        case "reply": {

            if (previousState === "WRITING_MESSAGE") {

                await sendSmartMessage(

                    clickerChatId,
                    "⛔️ شما در حال نوشتن یک پیام هستید! اول اونو بفرست یا «انصراف ❌» بزن.",
                    { keypad: CANCEL_KEYPAD, replyToMessageId: rubikaKeyPadMessageId }

                );

 


                return { nextState: previousState };
            }


            user.targetId = targetRubikaId;

            const randomIndex = Math.floor(Math.random() * randomData.replyMainMessage.length);
            const replyMessage = randomData.replyMainMessage[randomIndex];

            await sendSmartMessage(clickerChatId, replyMessage, {
                keypad: CANCEL_KEYPAD, replyToMessageId: rubikaKeyPadMessageId
            });

 
            return { nextState: "WRITING_MESSAGE", targetMessageId: targetMessageId };
        }

        case "seen": {
            const message = await Message.findOne({
                senderId: targetRubikaId,
                MessageIdDB: targetMessageId
            });

            const userSender = await User.findOne({ rubikaId: targetRubikaId });

            if (!message || !userSender) {
                console.log("پیام یا کاربر پیدا نشد");
                return { nextState: previousState || user.state };
            }

            if (message.isSeen) {
                await sendSmartMessage(
                    clickerChatId,
                    "کاربر قبلاً سین شدن رو فهمیده 😄",
                    { replyToMessageId: rubikaKeyPadMessageId }
                );
 
                return { nextState: previousState || user.state };
            }

            const randomIndex = Math.floor(Math.random() * randomData.seenMessageReceiver.length);
            const seenMessageReceiver = randomData.seenMessageReceiver[randomIndex];

            await sendSmartMessage(clickerChatId, seenMessageReceiver, {
                replyToMessageId: rubikaKeyPadMessageId
            });
 
            await Message.findOneAndUpdate(
                { MessageIdDB: targetMessageId },
                { isSeen: true }
            );

            if (userSender.chatId) {
                const randomSenderIndex = Math.floor(Math.random() * randomData.seenMessageSender.length);
                const seenMessageSender = randomData.seenMessageSender[randomSenderIndex];

                await sendSmartMessage(userSender.chatId, seenMessageSender, {
                    replyToMessageId: message.MessageIdDB
                });
 
            }


            return { nextState: previousState || user.state };
        }

        case "block": {
            user.blockedUsers.addToSet(targetRubikaId);

            const randomIndex = Math.floor(Math.random() * randomData.blocksenderMessage.length);
            const blockMessage = randomData.blocksenderMessage[randomIndex];

            await sendSmartMessage(clickerChatId, blockMessage, {
                replyToMessageId: rubikaKeyPadMessageId
            });
 

            const newKeypad = getActionInlineKeyboard(
                targetRubikaId,
                rubikaKeyPadMessageId,
                true
            );

            await editMessageKeypad(clickerChatId, rubikaKeyPadMessageId, newKeypad);

            return { nextState: previousState || user.state };
        }

        case "unblock": {
            user.blockedUsers.pull(targetRubikaId);

            await sendSmartMessage(
                clickerChatId,
                "آزادی مبارک! 🕊️ الان می‌تونه پیام بده.",
                { replyToMessageId: rubikaKeyPadMessageId }
            );

            try {
                const newKeypad = getActionInlineKeyboard(
                    targetRubikaId,
                    rubikaKeyPadMessageId,
                    false
                );

                await editMessageKeypad(clickerChatId, rubikaKeyPadMessageId, newKeypad);
            } catch (error) {
                console.error("خطا در تغییر دکمه به بلاک:", error);
            }

            return { nextState: previousState || user.state };
        }

        case "lastmsg": {
            try {
                const lastMessage = await Message.findOne({
                    senderId: targetRubikaId,
                    receiverId: senderId,
                    message: { $exists: true, $ne: "" }
                })
                    .sort({ createdAt: -1 })
                    .lean();

                if (lastMessage) {
                    const textToSend = `✉️ آخرین پیام ارسالی ایشون:\n\n${lastMessage.message}`;

                    await sendSmartMessage(clickerChatId, textToSend, {
                        replyToMessageId: rubikaKeyPadMessageId
                    });
                } else {
                    await sendSmartMessage(
                        clickerChatId,
                        "📭 هیچ پیامی از این کاربر تو سیستم ثبت نشده!",
                        { replyToMessageId: rubikaKeyPadMessageId }
                    );
                }
            } catch (err) {
                console.error("خطا در دریافت آخرین پیام:", err);
            }

            return { nextState: previousState || user.state };
        }

        default:
            await sendSmartMessage(clickerChatId, "ها؟ نفهمیدم چی شد 😅");
            return { nextState: previousState || user.state };
    }
}

module.exports = {
    hiddenActionHandler
};
