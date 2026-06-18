
const { sendSmartMessage, deleteMessage } = require("../services/rubikaApi.service")

const { getActionInlineKeyboard } = require("../keybord/AllKeybord.js")



const IRAN_PROVINCES = [
    {
        id: "azarbayjan_sharghi",
        name: "آذربایجان شرقی",
        counties: [
            "آذرشهر", "اسکو", "اهر", "بستان آباد", "بناب", "تبریز", "جلفا", "چاراویماق",
            "سراب", "شبستر", "عجب شیر", "کلیبر", "مراغه", "مرند", "ملکان", "میانه",
            "هریس", "هشترود", "ورزقان", "خداآفرین"
        ]
    },
    {
        id: "azarbayjan_gharbi",
        name: "آذربایجان غربی",
        counties: [
            "ارومیه", "اشنویه", "بوکان", "پیرانشهر", "تکاب", "چالدران", "خوی", "سردشت",
            "سلماس", "شاهین دژ", "شوط", "چایپاره", "ماکو", "مهاباد", "میاندوآب",
            "نقده", "پلدشت"
        ]
    },
    {
        id: "ardabil",
        name: "اردبیل",
        counties: [
            "اردبیل", "بیله سوار", "پارس آباد", "خلخال", "کوثر", "گرمی",
            "مشگین شهر", "نمین", "نیر", "سرعین", "اصلاندوز", "انگوت"
        ]
    },
    {
        id: "esfahan",
        name: "اصفهان",
        counties: [
            "آران و بیدگل", "اردستان", "اصفهان", "برخوار", "بوئین و میاندشت", "تیران و کرون",
            "چادگان", "خمینی شهر", "خوانسار", "سمیرم", "شاهین شهر و میمه", "شهرضا",
            "دهاقان", "فریدن", "فریدونشهر", "فلاورجان", "کاشان", "گلپایگان", "لنجان",
            "مبارکه", "نائین", "نجف آباد", "نطنز", "هرند", "جرقویه", "کوهپایه"
        ]
    },
    {
        id: "alborz",
        name: "البرز",
        counties: [
            "کرج", "ساوجبلاغ", "نظرآباد", "طالقان", "اشتهارد", "فردیس", "چهارباغ"
        ]
    },
    {
        id: "ilam",
        name: "ایلام",
        counties: [
            "ایلام", "آبدانان", "ایوان", "بدره", "چرداول", "دره شهر",
            "دهلران", "سیروان", "شیروان و چرداول", "ملکشاهی", "مهران", "چوار", "هلیلان"
        ]
    },
    {
        id: "bushehr",
        name: "بوشهر",
        counties: [
            "بوشهر", "تنگستان", "جم", "دشتستان", "دشتی", "دیر",
            "دیلم", "عسلویه", "کنگان", "گناوه"
        ]
    },
    {
        id: "tehran",
        name: "تهران",
        counties: [
            "تهران", "اسلامشهر", "بهارستان", "پاکدشت", "پردیس", "پیشوا",
            "شمیرانات", "دماوند", "رباط کریم", "ری", "شهریار",
            "فیروزکوه", "قدس", "قرچک", "ملارد", "ورامین"
        ]
    },
    {
        id: "chaharmahal_bakhtiari",
        name: "چهارمحال و بختیاری",
        counties: [
            "اردل", "بروجن", "بن", "سامان", "شهرکرد", "فارسان",
            "کوهرنگ", "کیار", "لردگان", "خانمیرزا", "فلارد"
        ]
    },
    {
        id: "khorasan_jonoobi",
        name: "خراسان جنوبی",
        counties: [
            "بیرجند", "بشرویه", "درمیان", "سرایان", "سربیشه", "طبس",
            "فردوس", "قائنات", "نهبندان", "خوسف", "زیرکوه"
        ]
    },
    {
        id: "khorasan_razavi",
        name: "خراسان رضوی",
        counties: [
            "مشهد", "باخرز", "بجستان", "بردسکن", "بینالود", "تایباد", "تربت جام",
            "تربت حیدریه", "چناران", "خلیل آباد", "خواف", "داورزن", "درگز",
            "رشتخوار", "سبزوار", "سرخس", "ششتمد", "صالح آباد", "فریمان",
            "فیروزه", "قوچان", "کاشمر", "کلات", "گناباد", "زاوه", "جوین",
            "جغتای", "خوشاب", "مه ولات", "نیشابور"
        ]
    },
    {
        id: "khorasan_shomali",
        name: "خراسان شمالی",
        counties: [
            "بجنورد", "اسفراین", "جاجرم", "راز و جرگلان", "شیروان",
            "فاروج", "گرمه", "مانه", "سملقان"
        ]
    },
    {
        id: "khuzestan",
        name: "خوزستان",
        counties: [
            "اهواز", "آبادان", "آغاجاری", "اندیکا", "اندیمشک", "امیدیه", "ایذه",
            "باغملک", "باوی", "بندر ماهشهر", "بهبهان", "حمیدیه", "خرمشهر",
            "دزپارت", "دزفول", "دشت آزادگان", "رامشیر", "رامهرمز", "شادگان",
            "شوش", "شوشتر", "گتوند", "لالی", "مسجدسلیمان", "هفتکل",
            "هندیجان", "هویزه", "کارون"
        ]
    },
    {
        id: "zanjan",
        name: "زنجان",
        counties: [
            "زنجان", "ابهر", "ایجرود", "خدابنده", "خرمدره", "طارم", "ماه نشان", "سلطانیه"
        ]
    },
    {
        id: "semnan",
        name: "سمنان",
        counties: [
            "سمنان", "آرادان", "دامغان", "سرخه", "شاهرود", "گرمسار", "مهدی شهر", "میامی"
        ]
    },
    {
        id: "sistan_baluchestan",
        name: "سیستان و بلوچستان",
        counties: [
            "زاهدان", "ایرانشهر", "چابهار", "خاش", "زابل", "سراوان", "سرباز",
            "نیکشهر", "کنارک", "زهک", "هیرمند", "دلگان", "مهرستان", "میرجاوه",
            "نیمروز", "تفتان", "قصرقند", "فنوج", "بمپور", "دشتیاری", "گلشن",
            "هامون", "لاشار"
        ]
    },
    {
        id: "fars",
        name: "فارس",
        counties: [
            "شیراز", "آباده", "ارسنجان", "استهبان", "اقلید", "بختگان", "بوانات",
            "پاسارگاد", "بیضا", "جهرم", "خرامه", "خرم بید", "خفر", "خنج",
            "داراب", "زرین دشت", "سپیدان", "سرچهان", "سروستان", "زرقان",
            "فراشبند", "فسا", "فیروزآباد", "قیر و کارزین", "کازرون", "کوار",
            "کوه چنار", "گراش", "لارستان", "لامرد", "مرودشت", "ممسنی", "مهر",
            "نی ریز", "اوز", "جویم"
        ]
    },
    {
        id: "qazvin",
        name: "قزوین",
        counties: [
            "قزوین", "آبیک", "آوج", "البرز", "بوئین زهرا", "تاکستان"
        ]
    },
    {
        id: "qom",
        name: "قم",
        counties: [
            "قم"
        ]
    },
    {
        id: "kordestan",
        name: "کردستان",
        counties: [
            "سنندج", "بانه", "بیجار", "دهگلان", "دیواندره", "سروآباد",
            "سقز", "قروه", "کامیاران", "مریوان"
        ]
    },
    {
        id: "kerman",
        name: "کرمان",
        counties: [
            "کرمان", "بافت", "بردسیر", "بم", "جیرفت", "راور", "رفسنجان",
            "رودبار جنوب", "زرند", "سیرجان", "شهربابک", "عنبرآباد", "قلعه گنج",
            "کهنوج", "منوجان", "نرماشیر", "ریگان", "فهرج", "ارزوئیه", "انار",
            "رابر", "فاریاب", "گنبکی", "جازموریان"
        ]
    },
    {
        id: "kermanshah",
        name: "کرمانشاه",
        counties: [
            "کرمانشاه", "اسلام آباد غرب", "پاوه", "ثلاث باباجانی", "جوانرود",
            "دالاهو", "روانسر", "سرپل ذهاب", "سنقر", "صحنه",
            "قصر شیرین", "کنگاور", "گیلانغرب", "هرسین"
        ]
    },
    {
        id: "kohgiluye_boyerahmad",
        name: "کهگیلویه و بویراحمد",
        counties: [
            "یاسوج", "باشت", "بهمئی", "بویر احمد", "چرام", "دنا",
            "کهگیلویه", "گچساران", "لنده", "مارگون"
        ]
    },
    {
        id: "golestan",
        name: "گلستان",
        counties: [
            "گرگان", "آزادشهر", "آق قلا", "بندر گز", "ترکمن", "رامیان",
            "علی آباد", "کردکوی", "کلاله", "گالیکش", "گمیشان",
            "گنبد کاووس", "مراوه تپه", "مینودشت"
        ]
    },
    {
        id: "gilan",
        name: "گیلان",
        counties: [
            "رشت", "آستارا", "آستانه اشرفیه", "املش", "انزلی", "تالش",
            "رودبار", "رودسر", "سیاهکل", "شفت", "صومعه سرا",
            "فومن", "لاهیجان", "لنگرود", "ماسال", "رضوانشهر", "خمام"
        ]
    },
    {
        id: "lorestan",
        name: "لرستان",
        counties: [
            "خرم آباد", "ازنا", "الیگودرز", "بروجرد", "پلدختر",
            "دورود", "دلفان", "سلسله", "کوهدشت", "نورآباد", "رومشکان", "چگنی"
        ]
    },
    {
        id: "mazandaran",
        name: "مازندران",
        counties: [
            "ساری", "آمل", "بابل", "بابلسر", "بهشهر", "تنکابن", "جویبار",
            "چالوس", "رامسر", "عباس آباد", "فریدونکنار", "قائم شهر",
            "گلوگاه", "محمودآباد", "نکا", "نور", "نوشهر",
            "میاندورود", "سیمرغ", "سوادکوه", "سوادکوه شمالی", "کلاردشت"
        ]
    },
    {
        id: "markazi",
        name: "مرکزی",
        counties: [
            "اراک", "آشتیان", "تفرش", "خمین", "خنداب", "دلیجان",
            "زرندیه", "ساوه", "شازند", "فراهان", "کمیجان", "محلات"
        ]
    },
    {
        id: "hormozgan",
        name: "هرمزگان",
        counties: [
            "بندرعباس", "ابوموسی", "بستک", "بشاگرد", "بندر لنگه", "پارسیان",
            "جاسک", "حاجی آباد", "خمیر", "رودان", "سیریک",
            "قشم", "میناب", "بوموسی"
        ]
    },
    {
        id: "hamedan",
        name: "همدان",
        counties: [
            "همدان", "اسدآباد", "بهار", "تویسرکان", "رزن",
            "فامنین", "کبودرآهنگ", "ملایر", "نهاوند", "درگزین"
        ]
    },
    {
        id: "yazd",
        name: "یزد",
        counties: [
            "یزد", "ابرکوه", "اردکان", "اشکذر", "بافق", "بهاباد",
            "تفت", "خاتم", "زارچ", "مهریز", "میبد", "مروست"
        ]
    }
];

function chunkButtons(items, rowSize = 3) {
    const rows = [];
    let buttons = [];

    for (const item of items) {
        buttons.push(item);

        if (buttons.length === rowSize) {
            rows.push({ buttons });
            buttons = [];
        }
    }

    if (buttons.length > 0) {
        rows.push({ buttons });
    }

    return rows;
}

function findProvinceById(provinceId) {
    return IRAN_PROVINCES.find(p => p.id === provinceId);
}

function findProvinceByName(provinceName) {
    return IRAN_PROVINCES.find(p => p.name === provinceName);
}

// ===============================
// نمایش لیست استان‌ها
// ===============================
async function showProvinces(anyChatId) {
    const provinceButtons = IRAN_PROVINCES.map(province => ({
        id: `province:${province.id}`,
        type: "Simple",
        button_text: province.name
    }));

    const rows = chunkButtons(provinceButtons, 3);

    const keyboard = { rows };

    return await sendSmartMessage(anyChatId, "استان خود را انتخاب کنید:", {
        inlineKeypad: keyboard
    });
}

// ===============================
// نمایش شهرستان‌های یک استان
// ===============================
async function showCounties(anyChatId, provinceId) {
    const province = findProvinceById(provinceId);

    if (!province) {
        return await sendSmartMessage(anyChatId, "استان مورد نظر پیدا نشد 😕");
    }

    const cityButtons = province.counties.map(cityName => ({
        id: `city:${province.id}:${cityName}`,
        type: "Simple",
        button_text: cityName
    }));

    const rows = chunkButtons(cityButtons, 3);

    // دکمه بازگشت
    rows.push({
        buttons: [
            {
                id: "nav:back_to_provinces",
                type: "Simple",
                button_text: "⬅️ بازگشت"
            }
        ]
    });

    const keyboard = { rows };


    return await sendSmartMessage(anyChatId, `شهرستان‌های استان ${province.name}:`, {
        inlineKeypad: keyboard
    });
}

// ===============================
// ذخیره استان
// ===============================
async function saveUserProvince(user, provinceId) {
    const province = findProvinceById(provinceId);

    if (!province) return false;

    user.province = province.name;
    user.city = null; // چون هنوز شهرستان انتخاب نشده
    await user.save();

    return true;
}

// ===============================
// ذخیره شهرستان
// ===============================

async function saveUsercity(user, provinceId, cityName) {
    const province = findProvinceById(provinceId);

    if (!province) return false;

    const cityExists = province.counties.includes(cityName);
    if (!cityExists) return false;

    user.province = province.name;
    user.city = cityName;
    await user.save();

    return true;
}

// ===============================
// هندل کلیک دکمه‌ها
// ===============================

async function handleLocationInlineButtons({ anyChatId, inlineButtonId, rubikaKeyPadMessageId, user }) {
    try {
        if (!inlineButtonId) return false;

        if (inlineButtonId === "nav:back_to_provinces") {
            if (rubikaKeyPadMessageId) {
                await deleteMessage(anyChatId, rubikaKeyPadMessageId);
            }

            await showProvinces(anyChatId);
            return true;
        }

        // انتخاب استان
        if (inlineButtonId.startsWith("province:")) {

            const provinceId = inlineButtonId.split(":")[1];

            const saved = await saveUserProvince(user, provinceId);

            if (!saved) {
                await sendSmartMessage(anyChatId, "خطا در ثبت استان 😕");
                return true;
            }

            if (rubikaKeyPadMessageId) {
                await deleteMessage(anyChatId, rubikaKeyPadMessageId);
            }
            await showCounties(anyChatId, provinceId);

            return true;
        }

         if (inlineButtonId.startsWith("city:")) {
            const parts = inlineButtonId.split(":");
            const provinceId = parts[1];
            const cityName = parts.slice(2).join(":");

            const saved = await saveUsercity(user, provinceId, cityName);
            if (!saved) {
                await sendSmartMessage(anyChatId, "خطا در ثبت شهرستان 😕");
                return true;
            }

            if (rubikaKeyPadMessageId) {
                await deleteMessage(anyChatId, rubikaKeyPadMessageId);
            }

            await sendSmartMessage(
                anyChatId,
                `✅ اطلاعات شما ثبت شد:\nاستان: ${user.province}\nشهرستان: ${user.city}`
            );

            return { nextState: "NORMAL" }
                ;
        }

        return false;
    } catch (error) {
        console.error("handleLocationInlineButtons error:", error);
        await sendSmartMessage(anyChatId, "هنگام پردازش انتخاب موقعیت خطایی رخ داد 😵");
        return true;
    }
}
module.exports = {
    showProvinces,
    handleLocationInlineButtons
}