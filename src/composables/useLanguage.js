import {ref, reactive} from 'vue';

const supportedLangs = ['en', 'ru'];

const translations = reactive({
    en: {
        autoTranslated: "Auto-translated",
        subtitle: "Artist meme maker, and a bit of a programmer...",
        socialTitle: "All social media:",
        supportSubtitle: "Support me:",
        lastWorks: "Latest posts on Telegram",
        postTg: "Post in Telegram",
        toPost: "Go to post →",
        retry: "Retry",
        openChannel: "Open channel",
        loadError: "Failed to load posts",
        clickHint: "click on the image to view",
        galleryTitle: "Favorite arts",
        gallerySubtitle: "Last update 15.09.2026",
        modsTitle: "Mods and projects",
        modsSubtitle: "Short descriptions and links",
        footer: "© 2026 ishwacha — no rights for men",
        melonDesc: "Replaces the egg in the hands of Rennala with a melon.",
        watermelonDesc: "Replaces the egg in the hands of Rennala with a watermelon",
        frierenDesc: "Sliders settings for Frieren character from anime \"Frieren beyond journey's end\".",
        dieAloneDesc: "This mod adds the song \"Die Alone\" by Zetsubo Extreme 7★",
        ctaTitle: "More posts on Telegram",
        ctaDescription: "All news, art, and updates",
        ctaFollow: "Follow →",
        modalVideobig: "Media is too big",
        modalVideobigSee: "Watch in Telegram",
        menuHome: "Home",
        menuCommissions: "Commissions",

        commStatusOpen: "Open",
        commStatusClosed: "Closed",
        commTitle: "Commissions",
        commContactBtn: "Message me on Telegram",
        commSubtitle: "Hi! Thank you for your interest in my artwork. Please look over this site for pricing and artwork samples.",
        commPriceUpdateDate: "Prices updated\n" +
            "23.10.2026",

        commPricing: "Prices and forms",
        priceBaseLabel: "Showcasing 1 character",
        priceAddonsTitle: "Add-ons",

        addonBg: "Complex background",
        addonExtraChar: "Additional character",
        addonPose: "Complex pose or angle",
        addonProp: "Weapon or complex prop",
        addonDetail: "Extra detailing",

        pricePortraitName: "Portraits",
        pricePortraitDesc: "Chest-up portrait focused on the face and the character's personality. Great for avatars and personal portraits.",

        priceHalfName: "Half Body",
        priceHalfDesc: "Waist-up or thigh-up figure: the pose and gesture are visible, with more room for costume and details.",

        priceFullName: "Full Body",
        priceFullDesc: "Full-body character: pose, composition and surroundings.",

        commTermsOfService: "Terms of Service",
        commRulesTitle: "Terms and conditions",

        tosPaymentTitle: "Payment and pricing",
        tosPayment1: "A 50% prepayment of the final price is required before I start. The rest is paid after you approve the final version and before you receive the files without a watermark.",
        tosPayment2: "The final price is the base price plus the add-ons you choose. It is fixed once the brief is agreed and only changes if the brief changes.",
        tosPayment3: "Payment methods and currency are discussed in DMs. ",

        tosDeadlineTitle: "Deadlines",
        tosDeadline1: "I give an estimated deadline before we start. It depends on complexity, my current queue and the number of revisions.",
        tosDeadline2: "Deadlines may shift for valid reasons (illness, force majeure, technical issues). I always warn you in advance.",
        tosDeadline3: "Rush orders with a tight deadline are accepted by separate arrangement; a rush fee may apply.",

        tosRevisionsTitle: "Revisions",
        tosRevisions1: "Two rounds of revisions at the sketch stage and one at the colour stage are included in the price.",
        tosRevisions2: "A revision is a refinement within the agreed brief. Changing the character, pose, composition or background after the sketch is approved counts as a new job and is paid separately.",
        tosRevisions3: "Revisions are not accepted after the final files are delivered, except for fixing mistakes on my side.",

        tosRightsTitle: "Rights and usage",
        tosRights1: "Personal, non-commercial use is included: avatars, wallpapers, posts and gifts.",
        tosRights2: "Commercial use (merch, advertising, games, monetised streams and videos) is only allowed by separate agreement and for an extra fee.",
        tosRights3: "Credit me as the artist when you publish the work — @ishwacha.",
        tosRights4: "I keep the right to post the finished work in my portfolio and social media. If the piece is private (a gift, an NDA), tell me in advance and I will not publish it.",
        tosRights5: "Reselling the artwork and using it in NFTs are not allowed.",

        tosCancelTitle: "Cancellation and refusal",
        tosCancel1: "If you cancel before I start, the prepayment is refunded in full.",
        tosCancel2: "If you cancel after work has started, the prepayment is not refunded, as it covers the time already spent.",
        tosCancel3: "I may decline a commission at any stage if the subject falls outside what I draw or if the communication becomes unacceptable. In that case the prepayment is refunded in proportion to the work not done.",

        tosOrderTitle: "Placing an order",
        tosOrder1: "Orders are placed via Telegram. Your request is accepted once the brief is agreed and the prepayment is received.",
        tosOrder2: "Send references and wishes before we start. If you have none, I will suggest options at the sketch stage.",
        tosOrder3: "I draw in my own style: I follow your references but never copy another artist's style or characters without the author's permission.",
        tosOrder4: "I usually reply within 1–2 days. If I stay silent longer, feel free to ping me.",

        commLoveDraw: "What I draw",
        commLove1: "",
        commLove2: "",
        commLove3: "",
        commLove4: "",
        commDontDraw: "What I don't draw",
        commDont1: "",
        commDont2: "",
        commDont3: "",
        commDont4: "",

        commCompleted: "Completed works",


    },
    ru: {
        autoTranslated: "Переведено автоматически",
        subtitle: "Художник мемодел, и немного программист...",
        socialTitle: "Все соц. сети:",
        supportSubtitle: "Поддержать меня:",
        lastWorks: "Последние посты в Telegram",
        postTg: "Пост в Telegram",
        toPost: "К посту →",
        retry: "Повторить",
        loadError: "Не удалось загрузить посты",
        openChannel: "Отрыть канал",
        clickHint: "тыкни на изображение для просмотра",
        galleryTitle: "Любимые арты",
        gallerySubtitle: "Обновлено 15.09.2026",
        modsTitle: "Моды и проекты",
        modsSubtitle: "Короткие описания и ссылки",
        footer: "© 2026 ishwacha — у мужлан нет прав",
        melonDesc: "Заменяет яйцо в руках Ренналы на сочную дыньку",
        watermelonDesc: "Заменяет яйцо в руках Ренналы на арбуз лооол",
        frierenDesc: "Настройки ползунков для персонажа Фрирен из аниме «Провожающая в последний путь Фрирен».",
        dieAloneDesc: "Этот мод добавляет песню «Die Alone» от Zetsubo Extreme 7★",
        ctaTitle: "Больше постов в Telegram",
        ctaDescription: "Все новости, арты и обновления",
        ctaFollow: "Подписаться →",
        modalVideobig: "Медиа такооое большое",
        modalVideobigSee: "Смотреть в Telegram",
        menuHome: "Главная",
        menuCommissions: "Коммишки",

        commStatusOpen: "Открыты",
        commStatusClosed: "Закрыты",
        commTitle: "Commissions",
        commContactBtn: "Написать в Telegram",
        commSubtitle: "Привет! Спасибо за ваш интерес к моим работам. Пожалуйста, ознакомьтесь с ценами и примерами моих работ на этом сайте.",
        commPriceUpdateDate: "Цены обновлены\n" +
            "23.10.2026",

        commPricing: "Цены и форматы",
        priceBaseLabel: "1 персонаж",
        priceAddonsTitle: "Надбавки",

        addonBg: "Сложный фон",
        addonExtraChar: "Дополнительный персонаж",
        addonPose: "Сложная поза или ракурс",
        addonProp: "Оружие или сложный реквизит",
        addonDetail: "Дополнительная детализация",

        pricePortraitName: "Портрет",
        pricePortraitDesc: "Погрудное изображение с акцентом на лицо и характер персонажа. Хорошо подходит для аватарок и личных портретов.",

        priceHalfName: "Полурост",
        priceHalfDesc: "Фигура по пояс или ляшки: видны поза и жест, больше пространства для костюма и деталей.",

        priceFullName: "Полнорост",
        priceFullDesc: "Персонаж в полный рост: поза, композиция и окружение.",

        commTermsOfService: "Условия использования",
        commRulesTitle: "Правила и условия",

        tosPaymentTitle: "Оплата и стоимость",
        tosPayment1: "Перед началом работы вносится предоплата 50% от итоговой стоимости. Остаток оплачивается после утверждения финального варианта и до передачи файлов без водяного знака.",
        tosPayment2: "Итоговая цена — это базовая стоимость плюс выбранные надбавки. Она фиксируется после согласования ТЗ и меняется только вместе с ТЗ.",
        tosPayment3: "Способы оплаты и валюта обсуждаются в личных сообщениях.",

        tosDeadlineTitle: "Сроки",
        tosDeadline1: "Ориентировочный срок я называю до начала работы. Он зависит от сложности, текущей очереди и количества правок.",
        tosDeadline2: "Сроки могут сдвигаться по уважительным причинам (болезнь, форс-мажор, проблемы с техникой). О любом сдвиге я предупреждаю заранее.",
        tosDeadline3: "Срочные заказы с жёстким дедлайном беру по отдельной договорённости — возможна наценка за срочность.",

        tosRevisionsTitle: "Правки",
        tosRevisions1: "Два раунда правок на этапе скетча и один на этапе цвета входят в цену.",
        tosRevisions2: "Правка — это доработка в рамках согласованного ТЗ. Смена персонажа, позы, композиции или фона после утверждения скетча считается новой работой и оплачивается отдельно.",
        tosRevisions3: "Правки после сдачи финальных файлов не принимаются, кроме исправления ошибок с моей стороны.",

        tosRightsTitle: "Права на работу",
        tosRights1: "Личное некоммерческое использование включено в цену: аватарки, обои, посты, подарки.",
        tosRights2: "Коммерческое использование (мерч, реклама, игры, монетизируемые стримы и видео) — только по отдельной договорённости и с наценкой.",
        tosRights3: "При публикации работы указывайте автора — @ishwacha.",
        tosRights4: "Я сохраняю за собой право публиковать готовую работу в портфолио и соцсетях. Если работа приватная (подарок, NDA), скажите об этом заранее — я не буду её публиковать.",
        tosRights5: "Перепродажа работ и их использование в NFT запрещены.",

        tosCancelTitle: "Отмена и отказ",
        tosCancel1: "Отмена до начала работы — предоплата возвращается полностью.",
        tosCancel2: "Отмена по инициативе заказчика после начала работы — предоплата не возвращается, так как покрывает уже затраченное время.",
        tosCancel3: "Я могу отказаться от заказа на любом этапе, если тема выходит за рамки того, что я рисую, или если общение выходит за рамки допустимого. В этом случае предоплата возвращается пропорционально невыполненной части.",

        tosOrderTitle: "Как оформить заказ",
        tosOrder1: "Заказ оформляется в Telegram. Заявка считается принятой после согласования ТЗ и получения предоплаты.",
        tosOrder2: "Референсы и пожелания присылайте до начала работы. Если их нет, я предложу варианты на этапе скетча.",
        tosOrder3: "Я рисую в своём стиле: ориентируюсь на референсы, но не копирую чужой стиль и чужих персонажей без разрешения автора.",
        tosOrder4: "Отвечаю обычно в течение 1–2 дней. Если я молчу дольше — напомните о себе.",

        commLoveDraw: "Что рисую",
        commLove1: "Фан-арт",
        commLove2: "Оригинальные персонажи",
        commLove3: "NSFW, но без секса",
        commLove4: "Хоть почти все арты у меня по Silksong - я могу рисовать не только по нему",

        commDontDraw: "Что НЕ рисую",
        commDont1: "Меха",
        commDont2: "Портреты по фото",
        commDont3: "Американские фурри, пони",
        commDont4: "Gore / Guro",

        commCompleted: "Выполненные заказы",




    }

});

export function useLanguage() {
    // Инициализация с проверкой localStorage или браузера
    const saved = localStorage.getItem('lang');
    const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().slice(0, 2);
    const initialLang = (saved && supportedLangs.includes(saved)) ? saved : (supportedLangs.includes(browserLang) ? browserLang : 'en');

    const currentLang = ref(initialLang);

    const t = (key) => {
        return translations[currentLang.value]?.[key] || translations['en'][key] || key;
    };

    const toggleLang = () => {
        const idx = supportedLangs.indexOf(currentLang.value);
        currentLang.value = supportedLangs[(idx + 1) % supportedLangs.length];
        localStorage.setItem('lang', currentLang.value);
    };

    return {
        currentLang,
        t,
        toggleLang
    };
}