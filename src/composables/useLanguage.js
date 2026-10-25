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
        menuOpen: "Open menu",
        menuClose: "Close menu",

        navPricing: "Pricing",
        navWillWont: "Will / Won't Draw",
        navTos: "Terms",
        navCompleted: "Completed",

        pageTitleHome: "Portfolio and commissions",
        notFoundTitle: "Page not found",
        notFoundText: "This page does not exist or has moved. Maybe start from the home page?",
        notFoundBack: "Back to home",
        skipToContent: "Skip to content",
        openImage: "Open image",
        artAlt: "Artwork by ishwacha",
        closeModal: "Close",
        galleryModalLabel: "Image preview",

        commStatusOpen: "Open",
        commStatusClosed: "Closed",
        commTitle: "Commissions",
        commContactBtn: "Message me on Telegram",
        commSubtitle: "Hi! Thank you for your interest in my artwork. Please look over this site for pricing and artwork samples.",
        commPriceUpdateDate: "Prices updated\n" +
            "23.10.2026",

        commPricing: "Prices and forms",

        // Order form
        formOpen: "Fill in the request",
        formOrTelegram: "or message me on Telegram",
        formTitle: "Commission request",
        formModalSubtitle: "Takes 2–3 minutes. The draft is saved automatically.",
        formSubtitle: "The more details you give, the more accurate the estimate. Extra files can be sent later in DM.",
        formFormat: "Format",
        formFormatPortrait: "Portrait",
        formFormatHalfbody: "Half body",
        formFormatFullbody: "Full body",
        formCharacters: "Characters",
        formCharsDecrease: "Fewer characters",
        formCharsIncrease: "More characters",
        formExtraCharHint: "Each additional character:",
        formBackground: "Background",
        formBgNone: "None",
        formBgSimple: "Simple",
        formBgDetailed: "Complex",
        formAddons: "Add-ons",
        formDeadline: "Preferred deadline",
        formDeadlinePlaceholder: "e.g. by the end of November",
        formDescription: "Idea description",
        formDescriptionPlaceholder: "Who the character is, what is happening, mood, important details...",
        formDescriptionTooShort: "Please describe the idea in at least a couple of sentences",
        formRefs: "Reference links",
        formRefsPlaceholder: "https://... (several links separated by spaces)",
        formRefsHint: "Links only: Imgur, Pinterest, Google Drive, a Telegram post. Extra files can be sent later in DM.",
        formName: "Your name",
        formNamePlaceholder: "name or nickname",
        formCredit: "Credit handle",
        formCreditPlaceholder: "@nick",
        formCreditHint: "If you want me to mention you when I post the artwork.",
        formContactMethod: "Where to reply",
        formContact: "Contact",
        formContactPlaceholder: "nickname or link",
        formContactTelegram: "Telegram",
        formContactDiscord: "Discord",
        formContactEmail: "Email",
        formContactTwitter: "Twitter / X",
        formContactRequired: "Please leave a contact where I can reply",
        formContactInvalid: "This email looks incomplete",
        formPrivacyNote: "The contact is used only to reply to this request.",
        formEstimate: "Estimated price",
        formEstimateNote: "Final price after the brief is agreed.",
        formEstimateDetails: "What's included",
        formBase: "Base",
        formSubmit: "Send request",
        formSending: "Sending...",
        formClose: "Close",
        formDraftRestored: "Draft restored",
        formDraftClear: "Clear",
        formSuccessTitle: "Request sent",
        formSuccessId: "Request number",
        formSuccessHint: "I will reply via the contact you provided. No payment is needed right now.",
        formErrorValidation: "Check the required fields",
        formErrorCaptcha: "Verification failed. Reload the page and try again.",
        formCaptchaPending: "Complete the “I'm not a robot” check above and send the request again.",
        formErrorRate: "Too many requests. Try again later or message me directly.",
        formErrorNetwork: "Could not send the request. Copy it and message me directly.",
        formCaptchaUnavailable: "Verification did not load. Copy the request and send it directly.",
        formFallbackHeader: "Commission request",
        formFallbackText: "Sending failed. Copy the request and send it via Boosty or Telegram — nothing will be lost.",
        formCopy: "Copy request",
        formCopied: "Copied",
        formWriteTelegram: "Message on Telegram",
        formWriteBoosty: "Message on Boosty",

        // How to order
        commHowTo: "How to order",
        commStep1: "Fill in the request: format, idea description and reference links.",
        commStep2: "I review it and reply where it is convenient for you - Telegram, Discord or email.",
        commStep3: "We discuss details, deadline and the final price.",
        commStep4: "After a 50% prepayment I start working.",

        priceBaseOneChar: "Showcasing 1 character",

        priceAddonsTitle: "Add-ons",

        addonSimpleBg: "Simple background (gradient/particles)",
        addonDetailedBg: "Complex background",
        addonExtraChar: "Additional character",
        addonPose: "Complex pose or angle",
        addonProp: "Weapon or complex prop",
        addonDetail: "Extra detailing",
        addonPet: "Pet / Minion",
        addonBustUp: "Bust up",

        pricePortraitName: "Portraits",
        pricePortraitDesc: "An image with an emphasis on the face and character of the character. Good for avatars.",

        priceHalfName: "Half Body",
        priceHalfDesc: "Waist-up or thigh-up figure: the pose and gesture are visible, with more room for costume and details.",

        priceFullName: "Full Body",
        priceFullDesc: "Full-body character: pose, composition and surroundings.",

        commWillWont: "Will / Won't Draw",
        commLoveDraw: "What I draw",
        commLove1: "Fan Art",
        commLove2: "Original characters",
        commLove3: "Mild NSFW / Ecchi / Suggestive themes (No explicit sexual acts)",
        commLove4: "Although almost all my art is based on Silksong, I can draw not only on it",
        commDontDraw: "What I don't draw",
        commDont1: "Mecha / Heavy machinery",
        commDont2: "Real people portraits from photos",
        commDont3: "American/Western furries, My Little Pony style",
        commDont4: "Gore / Guro",


        commTermsOfService: "Terms of Service",
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


        commCompleted: "Completed works",
        commCompletedDesc1: "Full body pose with perspective + background $250",

        devTitle: "Under development",
        devSubtitle: "I will finish everything here soon. Please check back later!"
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
        menuOpen: "Открыть меню",
        menuClose: "Закрыть меню",

        navPricing: "Прайс",
        navWillWont: "Что рисую",
        navTos: "Условия",
        navCompleted: "Выполненные",

        pageTitleHome: "Портфолио и заказы",
        notFoundTitle: "Страница не найдена",
        notFoundText: "Такой страницы нет или она переехала. Может, начать с главной?",
        notFoundBack: "На главную",
        skipToContent: "Перейти к содержимому",
        openImage: "Открыть изображение",
        artAlt: "Работа ishwacha",
        closeModal: "Закрыть",
        galleryModalLabel: "Просмотр изображения",

        commStatusOpen: "Открыты",
        commStatusClosed: "Закрыты",
        commTitle: "Commissions",
        commContactBtn: "Написать в Telegram",
        commSubtitle: "Привет! Спасибо за ваш интерес к моим работам. Пожалуйста, ознакомьтесь с ценами и примерами моих работ на этом сайте.",
        commPriceUpdateDate: "Цены обновлены\n" +
            "23.10.2026",

        commPricing: "Цены и форматы",

        // Форма заявки
        formOpen: "Заполнить заявку",
        formOrTelegram: "или написать в Telegram",
        formTitle: "Заявка на коммишку",
        formModalSubtitle: "Займёт 2–3 минуты. Черновик сохраняется сам.",
        formSubtitle: "Чем подробнее опишешь идею, тем точнее будет оценка. Файлы можно прислать позже лично.",
        formFormat: "Формат",
        formFormatPortrait: "Портрет",
        formFormatHalfbody: "Полурост",
        formFormatFullbody: "Полнорост",
        formCharacters: "Персонажей",
        formCharsDecrease: "Меньше персонажей",
        formCharsIncrease: "Больше персонажей",
        formExtraCharHint: "Каждый следующий персонаж:",
        formBackground: "Фон",
        formBgNone: "Без фона",
        formBgSimple: "Простой",
        formBgDetailed: "Сложный",
        formAddons: "Дополнительно",
        formDeadline: "Желаемый срок",
        formDeadlinePlaceholder: "например, до конца ноября",
        formDescription: "Описание идеи",
        formDescriptionPlaceholder: "Кто персонаж, что происходит, настроение, важные детали...",
        formDescriptionTooShort: "Опиши идею хотя бы в паре предложений",
        formRefs: "Ссылки на референсы",
        formRefsPlaceholder: "https://... (несколько ссылок через пробел)",
        formRefsHint: "Только ссылки: Imgur, Pinterest, Google Drive, пост в Telegram. Файлы можно прислать позже лично.",
        formName: "Как к тебе обращаться",
        formNamePlaceholder: "имя или ник",
        formCredit: "Ник для кредитов",
        formCreditPlaceholder: "@ник",
        formCreditHint: "Если хочешь, чтобы я упомянул тебя при публикации работы.",
        formContactMethod: "Где удобнее ответить",
        formContact: "Контакт",
        formContactPlaceholder: "ник или ссылка",
        formContactTelegram: "Telegram",
        formContactDiscord: "Discord",
        formContactEmail: "Email",
        formContactTwitter: "Twitter / X",
        formContactRequired: "Укажи, куда ответить",
        formContactInvalid: "Похоже, в почте опечатка",
        formPrivacyNote: "Контакт нужен только для ответа на эту заявку.",
        formEstimate: "Предварительная оценка",
        formEstimateNote: "Финальная цена — после согласования ТЗ.",
        formEstimateDetails: "Из чего складывается",
        formBase: "База",
        formSubmit: "Отправить заявку",
        formSending: "Отправляю...",
        formClose: "Закрыть",
        formDraftRestored: "Черновик восстановлен",
        formDraftClear: "Очистить",
        formSuccessTitle: "Заявка отправлена",
        formSuccessId: "Номер заявки",
        formSuccessHint: "Я отвечу в указанном контакте. Оплачивать сейчас ничего не нужно.",
        formErrorValidation: "Проверь обязательные поля",
        formErrorCaptcha: "Проверка не пройдена. Обнови страницу и попробуй ещё раз.",
        formCaptchaPending: "Подтверди проверку «я не робот» выше и отправь заявку ещё раз.",
        formErrorRate: "Слишком много заявок. Попробуй позже или напиши напрямую.",
        formErrorNetwork: "Не удалось отправить заявку. Скопируй её и напиши напрямую.",
        formCaptchaUnavailable: "Проверка не загрузилась. Скопируй заявку и отправь её напрямую.",
        formFallbackHeader: "Заявка на коммишку",
        formFallbackText: "Отправка не прошла. Скопируй заявку и отправь её через Boosty или Telegram — ничего не потеряется.",
        formCopy: "Скопировать заявку",
        formCopied: "Скопировано",
        formWriteTelegram: "Написать в Telegram",
        formWriteBoosty: "Написать в Boosty",


        // Как заказать
        commHowTo: "Как заказать",
        commStep1: "Заполни заявку: формат, описание идеи и ссылки на референсы.",
        commStep2: "Я посмотрю её и напишу туда, где тебе удобно — Telegram, Discord или на почту.",
        commStep3: "Обсудим детали, сроки и финальную цену.",
        commStep4: "После предоплаты 50% я начинаю работу.",
        priceBaseOneChar: "1 персонаж",

        priceAddonsTitle: "Надбавки",

        addonSimpleBg: "Простой фон (градиент, частички)",
        addonDetailedBg: "Сложный фон",
        addonExtraChar: "Дополнительный персонаж",
        addonPose: "Сложная поза или ракурс",
        addonProp: "Оружие или сложный реквизит",
        addonDetail: "Дополнительная детализация",
        addonPet: "Питомец / Прислужник",
        addonBustUp: "По грудь",

        pricePortraitName: "Портреты",
        pricePortraitDesc: "Изображение с акцентом на лицо и характер персонажа. Хорошо подходит для аватарок.",

        priceHalfName: "Полурост",
        priceHalfDesc: "Фигура по пояс или ляшки: видны поза и жест, больше пространства для костюма и деталей.",

        priceFullName: "Полнорост",
        priceFullDesc: "Персонаж в полный рост: поза, композиция и окружение.",

        commWillWont: "Что рисую / Что не рисую ",
        commLoveDraw: "Что рисую",
        commLove1: "Фан-арт",
        commLove2: "Оригинальные персонажи",
        commLove3: "Умеренный NSFW / Этти / Непристойные темы (без откровенных сексуальных действий)",
        commLove4: "Хоть почти все арты у меня по Silksong - я могу рисовать не только по нему",

        commDontDraw: "Что НЕ рисую",
        commDont1: "Меха",
        commDont2: "Портреты реальных людей по фото",
        commDont3: "Американские фурри, пони",
        commDont4: "Gore / Guro",

        commTermsOfService: "Правила и условия",

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


        commCompleted: "Выполненные заказы",
        commCompletedDesc1: "Полнорост поза с перспективой + фон $250",

        devTitle: "Раздел в разработке",
        devSubtitle: "Я скоро всё здесь доделаю. Загляните позже!"
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