const crypto = require("crypto");
const { User, Message } = require("../../models");
const { randomData } = require("../../RandomMessage");
const { sendSmartMessage, sendSmartFile } = require("../services/rubikaApi.service");
const { CANCEL_KEYPAD, MAIN_KEYPAD, getActionInlineKeyboard, hiddenChatKeypad, paymentKeyboard } = require("../keybord/AllKeybord")
const { streamTransferFile } = require("../util/downAndUplod")


async function writingMessageHandler({
    user,
    senderId,
    chatId,
    text,
    messageId,
    hasFile,
    fileId,
    fileName,
    fileSize,
    targetMessageId,

}) {


    let actionInlineKeypad = getActionInlineKeyboard(senderId, messageId)


    const mainUser = user.targetId;

    const findMainBlockUser = await User.findOne({ rubikaId: mainUser });

    if (findMainBlockUser && findMainBlockUser.blockedUsers.includes(senderId)) {

        const randomIndex = Math.floor(Math.random() * randomData.blockrecvierdMessage.length);
        const blockMessage = randomData.blockrecvierdMessage[randomIndex];

        await sendSmartMessage(chatId, blockMessage, {
            replyToMessageId: messageId,
            keypad: CANCEL_KEYPAD
        });

        user.targetId = null;

        return { nextState: "NORMAL" };
    }

    const systemCommands = [
        "لیست بلاکی ها ❌", "/blocked_users",
        "لینک ناشناس من 🔗", "/create_link",
        "چت با ناشناس💬", "hidden_chat",
        "تکست باکس🖊️", "/text_box",

        "/balance", "موجودی پیام 💳"
    ];

    if (systemCommands.includes(text)) {
        console.log("دستور سیستمی تشخیص داده شد، پیام ناشناس ارسال نشد 🛡️");
        return { nextState: "NORMAL" };
    }

    if (text === "انصراف ❌") {
        user.targetId = null;

        await sendSmartMessage(chatId, "ارسال پیام لغو شد! برگشتیم به منوی اصلی 🚫", {
            keypad: MAIN_KEYPAD
        });

        return { nextState: "NORMAL" };
    }

    if (!user.isUnlimited && user.messageLimit <= 0) {
        await sendSmartMessage(chatId, "⚠️ پیام رایگان شما تموم شده. برای ادامه یکی از پکیج‌ها رو تهیه کن:", {
            inlineKeypad: paymentKeyboard
        });

        user.targetId = null;
        return { nextState: "NORMAL" };
    }





    const anonymousMessage = text;
    const targetUser = await User.findOne({ rubikaId: mainUser });

    if (!targetUser || !targetUser.chatId) {
        user.targetId = null;

        await sendSmartMessage(chatId, "ای بابا! مخاطب مورد نظر پیدا نشد 🤷‍♂️", {
            keypad: MAIN_KEYPAD
        });

        return { nextState: "NORMAL" };
    }
    const messageData = await Message.findOne({
        senderId: mainUser,
        receiverId: senderId
    }).sort({ createdAt: -1 });

    console.log(messageData);


    let newFileId = null;





    const aliasCode = crypto.randomBytes(4).toString("hex");
    const firstFour = aliasCode.slice(0, 5);
    const newAlias = `shh${firstFour}`;
    const caption = "یک پیام ناشناس جدید دریافت کردید:📬\n\n";

    let dis =

        `روبيكا دسترسي ارسال عكس فيلم گيف و... رو محدود كرده و امكان ارسال هيچ گونه  موردي بجز متن 
امكان پذير نيست باتشكر از درك شما🩶`
    if (hasFile) {



        console.log("hasFile is run 🚀");
        newFileId = await streamTransferFile(fileId, fileName, fileSize);


        if (!newFileId) {

            user.targetId = null;

            await sendSmartMessage(chatId, dis, {


            });


            return { nextState: "NORMAL" };
        }


        if (text) {

            await sendSmartFile(targetUser.chatId, newFileId, caption + text, {
                inlineKeypad: actionInlineKeypad
            });
        } else {
            await sendSmartFile(targetUser.chatId, newFileId, caption, {
                inlineKeypad: actionInlineKeypad
            });
        }


    }
    else {
        console.log(`targetMessageId in writing message  : ${targetMessageId}`)
        await sendSmartMessage(targetUser.chatId, `📬 یک پیام ناشناس جدید دریافت کردید:\n\n${anonymousMessage}`, {
            inlineKeypad: actionInlineKeypad, replyToMessageId: messageData?.MessageIdDB
        });
    }

    try {
        await Message.create({
            senderId: senderId,
            receiverId: user.targetId,
            message: anonymousMessage,
            MessageIdDB: messageId,
            fileId: newFileId || null
        });

        await User.findOneAndUpdate(
            {
                rubikaId: mainUser,
                "inbox.rubikaId": { $ne: senderId }
            },
            {
                $push: {
                    inbox: {
                        rubikaId: senderId,
                        idCard: user.isCard
                    }
                }
            }
        );

        if (!user.isUnlimited && user.messageLimit > 0) {
            user.messageLimit -= 1;
        }

    } catch (error) {
        console.error("writingMessageHandler error:", error);
    }

    await sendSmartMessage(chatId, "✅ پیام ناشناس شما با موفقیت ارسال شد.", {
        replyToMessageId: messageId,
        keypad: MAIN_KEYPAD
    });

    user.targetId = null;
    return { nextState: "NORMAL" };
}

module.exports = {
    writingMessageHandler
};
