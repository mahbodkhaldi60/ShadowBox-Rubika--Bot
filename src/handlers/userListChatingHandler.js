

const { startAnonymousSearch } = require("../handlers/startAnonymousSearchhandler")
const { hiddenChatKeypad, reportUserKeybord, cancelNextUser, blockUserKeybord, retryOrBackKeyboard, giftShadowCoinKeybord, CANCEL_KEYPAD, AnanomuseChat } = require("../keybord/AllKeybord");
const { sendSmartMessage } = require("../services/rubikaApi.service");
const { streamTransferFile } = require("../util/downAndUplod")
const { User } = require("../../models")

const NORMAL_STATE = "NORMAL";
const CHATING_USERS_LIST = "CHATING_USERS_LIST";

const SPECIAL_TEXTS = new Set([
    "قطع کردن چت  ❌",
    "ریپورت کاربر ⚠️",
    "بلاک کردن کاربر 🚫",
    "نفر بعدی ⏭️",
    "شدوکارت📄",
    "اهدا شدو کوین 🎁",
    "جست و جوی مجدد 🔎"
]);

async function disconnectAnonymousChat(user1Id, user2Id, nextState = NORMAL_STATE) {
    return User.updateMany(
        { rubikaId: { $in: [user1Id, user2Id] } },
        {
            $set: {
                anonymousPartnerId: null,
                state: nextState,
                isRequester: false,
                sentCount: 0,
                coinDeducted: false
            }
        }
    );
}

async function handleRequesterMessageCost(userchat) {
    if (!userchat.isRequester) {
        const updated = await User.updateOne(
            { rubikaId: userchat.rubikaId, state: CHATING_USERS_LIST },
            { $inc: { sentCount: 1 } }
        );
        return updated.modifiedCount === 1;
    }

    const shouldCharge = (userchat.sentCount || 0) + 1 >= 15 && !userchat.coinDeducted;

    if (!shouldCharge) {
        const updated = await User.updateOne(
            { rubikaId: userchat.rubikaId, state: CHATING_USERS_LIST, isRequester: true },
            { $inc: { sentCount: 1 } }
        );
        return updated.modifiedCount === 1;
    }

    const charged = await User.findOneAndUpdate(
        {
            rubikaId: userchat.rubikaId,
            state: CHATING_USERS_LIST,
            isRequester: true,
            sentCount: 14,
            coinDeducted: { $ne: true },
            shadowCoin: { $gte: 4 }
        },
        {
            $inc: { sentCount: 1, shadowCoin: -4 },
            $set: { coinDeducted: true }
        },
        { returnDocument: "after" }
    );

    return !!charged;
}

async function UserListAnonymousChat({
    rubikaUserId,
    text,
    action,
    emptyValue = "ثبت نشده",
    }) {
    try {

        console.log(`action : >>>${action}`);

        console.log("UserListAnonymousChat is runnnnn");

        console.log(` log 1 `);

        const userchat = await User.findOne(
            {
                rubikaId: rubikaUserId,
                state: CHATING_USERS_LIST,
                anonymousPartnerId: { $ne: null }
            },
            {
                rubikaId: 1,
                chatId: 1,
                firstName: 1,
                profileName: 1,
                isRequester: 1,
                sentCount: 1,
                coinDeducted: 1,
                shadowCoin: 1,
                anonymousPartnerId: 1,
                state: 1
            }
        ).lean();
        console.log(`action : >>>${action}`);

        if (!userchat) {
            return { nextState: NORMAL_STATE };
        }
        console.log(` log 2 `);

        const userchat2 = await User.findOne(
            {
                rubikaId: userchat.anonymousPartnerId,
                state: CHATING_USERS_LIST,
                anonymousPartnerId: userchat.rubikaId
            },
            {
                rubikaId: 1,
                chatId: 1,
                firstName: 1,
                profileName: 1,
                gender: 1,
                age: 1,
                province: 1,
                city: 1
            }
        ).lean();

        console.log(` log 3 `);

        if (!userchat2) {
            await disconnectAnonymousChat(userchat.rubikaId, userchat.anonymousPartnerId, NORMAL_STATE);
            await sendSmartMessage(userchat.chatId, "❌ ارتباط ناشناس نامعتبر بود و بسته شد.", { keypad: hiddenChatKeypad });
            return { nextState: NORMAL_STATE };
        }
        console.log(` log 4 `);


        if (action == "end_chat") {

            console.log(`action : >>>${action}`);

            await disconnectAnonymousChat(userchat.rubikaId, userchat2.rubikaId, NORMAL_STATE);

            await Promise.allSettled([
                sendSmartMessage(userchat.chatId, `چت رو متوقف كردي برو يه هوايي بخور ${userchat2?.profileName || ""}`, { keypad: hiddenChatKeypad }),
                sendSmartMessage(userchat2.chatId, `طرف مقابل چت رو قطع كرد ${userchat?.profileName || ""}`, { keypad: hiddenChatKeypad })
            ]);

            return { nextState: NORMAL_STATE };
        }

        else if (action === "confirm_report") {
            await Promise.all([
                User.updateOne(
                    { rubikaId: userchat.rubikaId },
                    { $addToSet: { blockedUsers: userchat2.rubikaId } }
                ),
                User.updateOne(
                    { rubikaId: userchat2.rubikaId },
                    { $inc: { reportCount: 1 } }
                ),
                disconnectAnonymousChat(userchat.rubikaId, userchat2.rubikaId, NORMAL_STATE)
            ]);

            await Promise.allSettled([
                sendSmartMessage(userchat.chatId, `كاربر مورد نظر با موفقيت ريپورت شد ${userchat2.profileName || ""}`, { keypad: hiddenChatKeypad }),
                sendSmartMessage(userchat2.chatId, `كاربر شما را ريپورت كرد ${userchat.profileName || ""}`, { keypad: hiddenChatKeypad })
            ]);

            return { nextState: NORMAL_STATE };
        }

        else if (action === "confirm_block") {
            await Promise.all([
                User.updateOne(
                    { rubikaId: userchat.rubikaId },
                    { $addToSet: { blockedUsers: userchat2.rubikaId } }
                ),
                disconnectAnonymousChat(userchat.rubikaId, userchat2.rubikaId, NORMAL_STATE)
            ]);

            await Promise.allSettled([
                sendSmartMessage(userchat.chatId, `شما كاربر رو بلاك كرديد ${userchat2.profileName || ""}`, { keypad: hiddenChatKeypad }),
                sendSmartMessage(userchat2.chatId, `كاربر شما را بلاك كرد ${userchat.profileName || ""}`, { keypad: hiddenChatKeypad })
            ]);

            return { nextState: NORMAL_STATE };
        }

        else if (action === "confirm_gift_shadow_coin") {
            const amount = 5;

            const updatedSender = await User.findOneAndUpdate(
                {
                    rubikaId: userchat.rubikaId,
                    state: CHATING_USERS_LIST,
                    anonymousPartnerId: userchat2.rubikaId,
                    shadowCoin: { $gte: amount }
                },
                { $inc: { shadowCoin: -amount } },
                { returnDocument: "after" }
            );

            if (!updatedSender) {
                await sendSmartMessage(userchat.chatId, "❌ موجودی کافی نیست یا چت معتبر نیست.");
                return { nextState: CHATING_USERS_LIST };
            }

            await User.updateOne(
                { rubikaId: userchat2.rubikaId },
                { $inc: { shadowCoin: amount } }
            );

            await Promise.allSettled([
                sendSmartMessage(userchat.chatId, `✅ شما به این کاربر ${amount} کوین دادید 😄 ${userchat2.profileName || ""}`),
                sendSmartMessage(userchat2.chatId, `🎁 این کاربر به تو ${amount} کوین داد 😄 ${userchat.profileName || ""}`)
            ]);

            return { nextState: CHATING_USERS_LIST };
        }

        else if (action === "report_user") {
            await sendSmartMessage(userchat.chatId, `آیا واقعاً مطمئنی کاربر ${userchat2.profileName} رو ریپورت کنی ؟`, { inlineKeypad: reportUserKeybord });
            return { nextState: CHATING_USERS_LIST };
        }

        else if (action === "block_user") {
            await sendSmartMessage(userchat.chatId, `آیا واقعاً مطمئنی کاربر ${userchat2.profileName} رو بلاک کنی ؟`, { inlineKeypad: blockUserKeybord });
            return { nextState: CHATING_USERS_LIST };
        }

        else if (action === "gift_shadow_coin") {
            await sendSmartMessage(userchat.chatId, `آیا واقعاً مطمئنی به کاربر ${userchat2.profileName} 5 تا شدوکوین بدی ؟`, { inlineKeypad: giftShadowCoinKeybord });
            return { nextState: CHATING_USERS_LIST };
        }

        else if (action === "show_profile") {
            const shadowCard = `
كاربر چت شدو کارت | ShadowCart

${userchat2?.firstName || emptyValue} / ${userchat2?.idCard || emptyValue}

نام : ${userchat2?.profileName || emptyValue}
جنسیت : ${userchat2?.gender || emptyValue}
سن : ${userchat2?.age || emptyValue}
استان : ${userchat2?.province || emptyValue}
شهر : ${userchat2?.city || emptyValue}
            `.trim();

            await sendSmartMessage(userchat.chatId, shadowCard);
            return { nextState: CHATING_USERS_LIST };
        }

        else if (text && !SPECIAL_TEXTS.has(text)) {
            const charged = await handleRequesterMessageCost(userchat);

            if (!charged && userchat.isRequester && (userchat.sentCount || 0) + 1 >= 15) {
                await sendSmartMessage(userchat.chatId, "❌ موجودی کافی نیست؛ پیام ارسال نشد 😅");
                return { nextState: CHATING_USERS_LIST };
            }

            await sendSmartMessage(userchat2.chatId, text);
            return { nextState: CHATING_USERS_LIST };
        }

        return { nextState: CHATING_USERS_LIST };

    } catch (error) {
        console.error("AnonymousChatHandler Error:", error);
        return { nextState: NORMAL_STATE };
    }
}

module.exports = {
    UserListAnonymousChat
}
