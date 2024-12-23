import { Locator } from "@playwright/test";

/**
 * 
 * @param rangeInputLocator the locator for range input
 * @param minAmountCents min amount you need to fill
 * @param maxAmountCents max amount you need to fill
 * @param rangeMinCents min amount accepted by the input
 * @param rangeMaxCents max amount accepted by the input
 * 
 */
export async function fillRangeInput(
    rangeInputLocator: Locator,
    minAmountCents: number,
    maxAmountCents: number,
    rangeMinCents: number,
    rangeMaxCents: number,
) {
    const [percMinAmount, percMaxAmount] = getPercentageAmount(
        minAmountCents,
        maxAmountCents,
        rangeMinCents,
        rangeMaxCents
    );
    await rangeInputLocator.locator("input[data-index='0']").fill(`${percMinAmount}`);
    await rangeInputLocator.locator("input[data-index='1']").fill(`${percMaxAmount}`);
    await rangeInputLocator.page().click('body');
}

function getPercentageAmount(
    minAmount: number,
    maxAmount: number,
    minRange: number,
    maxRange: number,
) {

    const clampedMinAmount = clamp(minAmount, minRange, maxRange);
    const clampedMaxAmount = clamp(maxAmount, minRange, maxRange);

    const percMinAmount = Math.ceil((clampedMinAmount / (maxRange - minRange)) * 100);
    const percMaxAmount = Math.floor((clampedMaxAmount / (maxRange - minRange)) * 100);

    return [percMinAmount, percMaxAmount];
}

function clamp(num: number, min: number, max: number) {
    if (num < min) {
        return min;
    }
    if (num > max) {
        return max;
    }
    return num;
}
