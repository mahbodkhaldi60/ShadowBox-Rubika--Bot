const { sendSmartMessage } = require("../services/rubikaApi.service");
const { mainList, shadowCoinGiftKeyboard } = require("../keybord/AllKeybord")
const { User } = require("../../models");

const emptyValue = "ثبت نشده"
function getSmartLastOnline(lastOnline) {
    if (!lastOnline) return "نامشخص";

    const now = Date.now();
    const diffMs = now - lastOnline;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 3) return "آنلاين👀";
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    if (days <= 7) return `${days} روز پیش`;

    return "خیلی وقت پیش";
}


function getPersianDateTime(timestamp = Date.now()) {
    const date = new Date(timestamp);

    const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",

    };

    return new Intl.DateTimeFormat("fa-IR-u-nu-latn", options).format(date);
}



const USER_LIST_PAGE_SIZE = 15;

function buildBaseUserListFilter(user) {
    return {
        completeProfile: true,

        // مهم: خود کاربر داخل لیست نیاد
        rubikaId: { $ne: user.rubikaId || user.chatId }
    };
}

function buildFilteredUserListQuery(user) {
    const filter = buildBaseUserListFilter(user);

    const userListFilter = user.userListFilter || {};

    if (userListFilter.gender) {
        filter.gender = userListFilter.gender;
    }

    if (
        userListFilter.minAge !== null &&
        userListFilter.minAge !== undefined &&
        userListFilter.maxAge !== null &&
        userListFilter.maxAge !== undefined
    ) {
        filter.age = {
            $gte: userListFilter.minAge,
            $lte: userListFilter.maxAge
        };
    }

    if (userListFilter.provinceMode === "MY_PROVINCE" && user.province) {
        filter.province = user.province;
    }

    return filter;
}

async function getUserListPage(user, page = 0, useFallback = false) {
    const skip = page * USER_LIST_PAGE_SIZE;

    const filter = useFallback
        ? buildBaseUserListFilter(user)
        : buildFilteredUserListQuery(user);

    const users = await User.find(filter)
        .select("profileName age province gender rubikaId idCard city lastOnline")
        .sort({ lastOnline: -1 })
        .skip(skip)
        .limit(USER_LIST_PAGE_SIZE + 1)
        .lean();

    const hasNextPage = users.length > USER_LIST_PAGE_SIZE;

    return {
        users: users.slice(0, USER_LIST_PAGE_SIZE),
        hasNextPage
    };
}

function renderUserList(users, page = 0, useFallback = false) {
    let textResult = "";

    if (useFallback) {
        textResult += `⚠️ کاربری با فیلترهای انتخابی پیدا نشد.\n`;
        textResult += `برای همین لیست کاربران بدون فیلتر نمایش داده شد.\n\n`;
    }

    textResult += `📜 لیست کاربران پیدا شده:
📄 صفحه ${page + 1}
(${getPersianDateTime()})\n\n`;

    users.forEach((item, index) => {
        const lastOnLine = getSmartLastOnline(item.lastOnline);

        let genderStiker = "👤";
        if (item.gender === "پسر") genderStiker = "👦🏻";
        else if (item.gender === "دختر") genderStiker = "👧🏻";

        const rowNumber = page * USER_LIST_PAGE_SIZE + index + 1;

        textResult += `- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
${rowNumber} - ${item.profileName || "بدون نام"}   /${item.idCard || "-"}
📍${item.province || "-"}(${item.city || "-"})  ${genderStiker}(${item.age || "-"})  ⌛:${lastOnLine} ${item.isChating ? "درحال چت💬" : ""} 


`;
    });

    return textResult;
}

async function sendUserListPage(user, anyChatId, page = 0, options = {}) {
    let useFallback = options.useFallback || false;

    let result = await getUserListPage(user, page, useFallback);

    // اگر صفحه اول با فیلتر خالی بود، بدون فیلتر سرچ کن
    if (!useFallback && page === 0 && result.users.length === 0) {
        useFallback = true;
        result = await getUserListPage(user, 0, true);
        page = 0;
    }

    if (result.users.length === 0) {
        await sendSmartMessage(anyChatId, "فعلاً کاربری برای نمایش وجود ندارد 🥲");
        return {
            success: false,
            page,
            useFallback,
            hasNextPage: false
        };
    }

    const textResult = renderUserList(result.users, page, useFallback);

    await sendSmartMessage(anyChatId, textResult, {
        inlineKeypad: mainList
    });

    return {
        success: true,
        page,
        useFallback,
        hasNextPage: result.hasNextPage
    };
}



module.exports = {
    buildBaseUserListFilter,
    buildFilteredUserListQuery,
    getUserListPage,
    renderUserList,
    sendUserListPage
}