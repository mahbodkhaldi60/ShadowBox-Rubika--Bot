
const { User } = require("../../models")
const { sendSmartMessage } = require("../services/rubikaApi.service");
const { hiddenChatKeypad } = require("../keybord/AllKeybord")
async function sendDirectMessage({ user, text, anyChatId }) {
    const directMessageText = text?.trim();

    if (!directMessageText) {
        await sendSmartMessage(
            anyChatId,
            "پیام خالیه 😄 یه چیزی بنویس بعد بفرست."
        );

        return {
            nextState: "SEND_DIRECT_MESSAGE"
        };
    }

    const targetRubikaId = user.directTargetRubikaId;

    if (!targetRubikaId) {
        await User.updateOne(
            { rubikaId: user.rubikaId },
            {
                $set: {
                    state: "NORMAL"
                },
                $unset: {
                    directTargetRubikaId: ""
                }
            }
        );

        await sendSmartMessage(
            anyChatId,
            "کاربر مقصد برای دایرکت پیدا نشد 😕 دوباره تلاش کن."
        );

        return {
            nextState: "NORMAL"
        };
    }

    const targetUser = await User.findOne({ rubikaId: targetRubikaId });

    if (!targetUser) {
        await User.updateOne(
            { rubikaId: user.rubikaId },
            {
                $set: {
                    state: "NORMAL"
                },
                $unset: {
                    directTargetRubikaId: ""
                }
            }
        );

        await sendSmartMessage(
            anyChatId,
            "کاربر مقصد پیدا نشد 😕"
        );

        return {
            nextState: "NORMAL"
        };
    }

    if (targetUser.rubikaId === user.rubikaId) {
        await User.updateOne(
            { rubikaId: user.rubikaId },
            {
                $set: {
                    state: "NORMAL"
                },
                $unset: {
                    directTargetRubikaId: ""
                }
            }
        );

        await sendSmartMessage(
            anyChatId,
            "به خودت پیام دادی؟ 😄 این دیگه خیلی خودمونی شد!"
        );

        return {
            nextState: "NORMAL"
        };
    }

    const replyDirectKeyboard = {
        rows: [
            {
                buttons: [

                    {
                        id: `SEND_DIRECT_${user.rubikaId}`,
                        type: "Simple",
                        button_text: "📩 پاسخ دادن"
                    },
                    {
                        id: `REQUEST_CHAT_${user.rubikaId}`,
                        type: "Simple",
                        button_text: "💬 درخواست چت"
                    }
                ]
            }

        ]
    };

    await sendSmartMessage(
        targetUser.chatId,
        `📩 پیام دایرکت جدید داری!\n\n` +
        `👤 از طرف: /${user.idCard || user.firstName || "کاربر ناشناس"}\n\n` +
        `💬 متن پیام:\n${directMessageText}`,
        { inlineKeypad: replyDirectKeyboard }
    );

    await User.updateOne(
        { rubikaId: user.rubikaId },
        {
            $set: {
                state: "NORMAL"
            },
            $unset: {
                directTargetRubikaId: ""
            },
            $inc: {
                shadowCoin: -1
            }
        }
    );

    await sendSmartMessage(
        anyChatId,
        ` پیام دایرکتت ارسال شد ✅📩

يك شدو كوين از تو كم شد 💳
       `
        , { keypad: hiddenChatKeypad });

    return {
        nextState: "NORMAL"
    };
}

module.exports = { sendDirectMessage }