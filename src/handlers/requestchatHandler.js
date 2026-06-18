
const { User } = require("../../models.js")
const { sendSmartMessage } = require("../services/rubikaApi.service")
async function requestchatHandler({ action, user, anyChatId }) {



    const targetRubikaId = action.replace("REQUEST_CHAT_", "");

    const targetUser = await User.findOne({ rubikaId: targetRubikaId });



    if (!targetUser) {
        await sendSmartMessage(anyChatId, "کاربر مقصد پیدا نشد 😕");
        return { nextState: "NORMAL" };
    }
    let limitFiveDay = 5 * 24 * 60 * 60 * 1000;
    let iscanRequest = Date.now() - targetUser.lastOnline;
    if (iscanRequest > limitFiveDay) {
        await sendSmartMessage(anyChatId, "كاربر پيش از 5 روز است كه انلاين نشده و نمي توني به اون درخواست بدهي ")
        return { nextState: "NORMAL" };
    }
    if (targetUser.isChating) {
        await sendSmartMessage(anyChatId, "كاربر مورد نظر در حال چت با نفر ديگري هست نمي توني  به اون درخواست چت بدي ");
        return { nextState: "NORMAL" };
    }
    if (targetUser.rubikaId === user.rubikaId) {
        await sendSmartMessage(anyChatId, "نمی‌تونی به خودت درخواست چت بدی 😄");
        return { nextState: "NORMAL" };
    }

    const pendingRequest = targetUser.pendingChatRequestFrom.find((item) => {
        return item.rubikaId == user.rubikaId
    })

    if (pendingRequest?.requsetLimit) {
        await sendSmartMessage(anyChatId, `شما امکان ارسال درخواست به ${targetUser.profileName} رو تا 5 دقیقه دیگه ندارید`);
        return { nextState: "NORMAL" };
    }
    if (pendingRequest) {
        await User.updateOne(
            {
                rubikaId: targetUser.rubikaId,
                "pendingChatRequestFrom.rubikaId": user.rubikaId
            },
            {
                $set: {
                    "pendingChatRequestFrom.$.requsetLimit": true
                }
            }
        );
    } else {
        await User.updateOne(
            {
                rubikaId: targetUser.rubikaId,
                "pendingChatRequestFrom.rubikaId": { $ne: user.rubikaId }
            },
            {
                $push: {
                    pendingChatRequestFrom: {
                        rubikaId: user.rubikaId,
                        requsetLimit: true
                    }
                }
            }
        );
    }


    setTimeout(async () => {
        await User.updateOne(
            {
                rubikaId: targetUser.rubikaId,
                "pendingChatRequestFrom.rubikaId": user.rubikaId
            },
            {
                $set: {
                    "pendingChatRequestFrom.$.requsetLimit": false
                }
            }
        );

        console.log("محدودیت درخواست کاربر برداشته شد");
    }, 5 * 60 * 1000);

    const requestChatKeyboard = {
        "rows": [
            {
                "buttons": [
                    {
                        id: `REJECT_CHAT_${user.rubikaId}`,
                        type: "Simple",
                        button_text: "❌ رد درخواست چت"
                    },

                    {
                        id: `ACCEPT_CHAT_${user.rubikaId}`,
                        type: "Simple",
                        button_text: "✅ قبول درخواست چت"
                    }


                ]
            }
        ]




    };


    await sendSmartMessage(targetUser.chatId, `
💬 یه درخواست چت جدید داری!

👤 از طرف:  /${user.idCard || "کاربر ناشناس"}
اگه دوست داشتی می‌تونی قبولش کنی 😄
`, { inlineKeypad: requestChatKeyboard })


    await sendSmartMessage(
        anyChatId,
        `درخواست چت براي ${targetUser.profileName} ارسال  شد✅


حالا منتظر بمون ببین طرف درخواست رو قبول مي كنه يانه 👀💌`
    );

    return {
        nextState: "NORMAL"
    };
}
module.exports = { requestchatHandler }