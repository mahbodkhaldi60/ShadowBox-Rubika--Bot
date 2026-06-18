
const { getinfo } = require("../services/rubikaApi.service")
const { User, Counter, Message } = require("../../models")
const crypto = require('crypto');




async function generateUnbreakableLink(number) {

    const hmac = crypto.createHmac("sha256", process.env.SALT)

    hmac.update(number.toString())

    const fullHash = hmac.digest("hex")

    return fullHash.substring(0, 10)
}

async function getNextSequence() {
    const counter = await Counter.findByIdAndUpdate(
        "userIdCounter",
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    )

    return counter.seq

}


async function getUserInfo(anyChatId) {

    try {

        const response = await getinfo(anyChatId)

        const userInfo = response?.data?.chat;

        if (!userInfo) return null;

        return {
            userId: userInfo.user_id,
            firstName: userInfo.first_name,
            userName: userInfo.username,
        };
    }

    catch (error) {
        console.error("getUserInfo error:", error);
        return null;
    }

}


async function findOrCreateUser(rubikaUserId, anyChatId, time) {
    let user = await User.findOne({ rubikaId: rubikaUserId });

    const USERINFO = await getUserInfo(anyChatId);

    const firstName = USERINFO?.firstName || "";
    const userName = USERINFO?.userName || "";

    const parsedTime = Number(time);

    const lastOnline = Number.isFinite(parsedTime)
        ? parsedTime * 1000
        : Date.now();

    const oneMinuteAgo = Date.now() - 60 * 1000;

    if (!user) {
        const counter = await getNextSequence()

        const mahbodHash = await generateUnbreakableLink(counter)
        const aliasCode = crypto.randomBytes(4).toString("hex");
        const firstFour = aliasCode.slice(0, 7);
        const newAlias = `shh${firstFour}`;
        let finalformat = `SHH-${mahbodHash}`



        user = new User({
            rubikaId: rubikaUserId,
            firstName,
            userName,
            chatId: anyChatId,
            idCard: newAlias,
            anonymousName: finalformat,
            lastOnline,

        });

        await user.save();

        return user;
    }

    const updateQuery = {};

    if (
        !Number.isFinite(Number(user.lastOnline)) ||
        user.lastOnline < oneMinuteAgo ||
        user.lastOnline === 0
    ) {
        updateQuery.lastOnline = lastOnline;
    }

    if (firstName !== user.firstName) {
        updateQuery.firstName = firstName;
    }

    if (userName !== user.userName) {
        updateQuery.userName = userName;
    }

    if (anyChatId !== user.chatId) {
        updateQuery.chatId = anyChatId;
    }

    if (Object.keys(updateQuery).length > 0) {
        await User.updateOne(
            { rubikaId: rubikaUserId },
            { $set: updateQuery }
        );

        user = await User.findOne({ rubikaId: rubikaUserId });
    }

    return user;
}


module.exports = {

    generateUnbreakableLink,
    getUserInfo,
    findOrCreateUser
}