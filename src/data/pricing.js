// Единственный источник цен: прайс на странице заказов и калькулятор в форме
// считают из этого файла. Меняете цену здесь — меняется везде.
//
// labelKey — ключ перевода из src/composables/useLanguage.js.
// id       — технический идентификатор надбавки (используется в форме).

export const PRICING = {
    portrait: {
        base: 60,
        addons: [
            {id: 'simpleBg', labelKey: 'addonSimpleBg', price: 20},
            {id: 'detailedBg', labelKey: 'addonDetailedBg', price: 40},
            {id: 'extraChar', labelKey: 'addonExtraChar', price: 40},
            {id: 'prop', labelKey: 'addonProp', price: 25}
        ]
    },
    halfbody: {
        base: 80,
        addons: [
            {id: 'simpleBg', labelKey: 'addonSimpleBg', price: 20},
            {id: 'detailedBg', labelKey: 'addonDetailedBg', price: 70},
            {id: 'extraChar', labelKey: 'addonExtraChar', price: 60},
            {id: 'prop', labelKey: 'addonProp', price: 25},
            {id: 'pet', labelKey: 'addonPet', price: 35}
        ]
    },
    fullbody: {
        base: 100,
        addons: [
            {id: 'pose', labelKey: 'addonPose', price: 50},
            {id: 'simpleBg', labelKey: 'addonSimpleBg', price: 20},
            {id: 'detailedBg', labelKey: 'addonDetailedBg', price: 100},
            {id: 'extraChar', labelKey: 'addonExtraChar', price: 75},
            {id: 'prop', labelKey: 'addonProp', price: 30},
            {id: 'pet', labelKey: 'addonPet', price: 40}
        ]
    }
}

// Метаданные форматов для прайса и формы
export const FORMATS = {
    portrait: {
        nameKey: 'pricePortraitName',
        descKey: 'pricePortraitDesc',
        shortKey: 'formFormatPortrait',
        examples: 'portrets'
    },
    halfbody: {
        nameKey: 'priceHalfName',
        descKey: 'priceHalfDesc',
        shortKey: 'formFormatHalfbody',
        examples: 'halfbody'
    },
    fullbody: {
        nameKey: 'priceFullName',
        descKey: 'priceFullDesc',
        shortKey: 'formFormatFullbody',
        examples: 'fullbody'
    }
}

export const FORMAT_IDS = Object.keys(FORMATS)

export function getAddons(formatId) {
    return PRICING[formatId]?.addons ?? []
}

export function hasAddon(formatId, addonId) {
    return getAddons(formatId).some(addon => addon.id === addonId)
}

/**
 * Считает предварительную оценку по состоянию формы.
 *
 * @param {{format: string, characters: number, background: string, pose: boolean, prop: boolean, pet: boolean}} selection
 * @param {(key: string) => string} t — функция перевода
 * @returns {{base: number, total: number, parts: Array, breakdown: string}}
 */
export function calculateEstimate(selection, t) {
    const pricing = PRICING[selection.format]
    if (!pricing) {
        return {base: 0, total: 0, parts: [], breakdown: ''}
    }

    const parts = []
    let total = pricing.base

    const add = (addonId, count = 1) => {
        const addon = pricing.addons.find(item => item.id === addonId)
        if (!addon || count < 1) return

        const sum = addon.price * count
        total += sum
        parts.push({
            id: addon.id,
            label: t(addon.labelKey),
            price: addon.price,
            count,
            sum
        })
    }

    if (selection.background === 'simple') add('simpleBg')
    if (selection.background === 'detailed') add('detailedBg')
    if (selection.pose) add('pose')

    const extraCharacters = Math.max(0, (Number(selection.characters) || 1) - 1)
    if (extraCharacters > 0) add('extraChar', extraCharacters)

    if (selection.prop) add('prop')
    if (selection.pet) add('pet')

    const breakdown = [
        `${t('formBase')} $${pricing.base}`,
        ...parts.map(part => part.count > 1
            ? `${part.label} ×${part.count} +$${part.sum}`
            : `${part.label} +$${part.price}`)
    ].join(' + ')

    return {base: pricing.base, total, parts, breakdown}
}
