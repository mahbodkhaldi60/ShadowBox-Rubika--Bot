const { getUserInfo } = require("../services/user.service")
const { getinfo, sendSmartMessage } = require("../services/rubikaApi.service")



async function createLink(senderId, anyChatId, anonymousNamess) {




    const uniqueLink = `https://rubika.ir/ShadowBoxBot?start=${anonymousNamess}`;
    
    const USERIFNO = await getUserInfo(anyChatId)


    console.log(USERIFNO.firstName)

    console.log("userInfo : ", getUserInfo.firstName)

    const replyMessage = `💌 لینک پیام ناشناس تو ساخته شد (${USERIFNO.firstName}):

🔗 ${uniqueLink}

+ یادت باشه برای اینکه کسی بهت پیام بده باید لینک رو برام بفرسته :)
`
    await sendSmartMessage(anyChatId, replyMessage)

}


module.exports = { createLink }