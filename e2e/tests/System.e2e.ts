import { By, Key, ThenableWebDriver } from "selenium-webdriver";
import { eachDevice } from "../src/RunnerFactory";
import { expect } from "chai";

const preScript = `
    _siv3dStartUserActionHook();

    window.UTF8ToString = function(text) {
        return text;
    };
`;

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function LaunchBrowser(driver: ThenableWebDriver, url: string) {
    await driver.executeScript("_siv3dLaunchBrowser(arguments[0]);", url);
}

eachDevice(function(it) {
    it("LaunchBrowser", async function(driver) {
        await driver.executeScript(preScript);

        const canvasElement = await driver.findElement(By.id("canvas"));
        await LaunchBrowser(driver, "https://www.google.com");
        await canvasElement.sendKeys(Key.F1);
        await sleep(50);

        const originalWindow = await driver.getWindowHandle();
        const windows = await driver.getAllWindowHandles();

        expect(windows.length, "New window should be opened").to.greaterThanOrEqual(2);

        try {
            const newWindow = windows[1];
            await driver.switchTo().window(newWindow);

            expect(await driver.getCurrentUrl()).contains("https://www.google.com");
            await driver.close();
        } finally {
            await driver.switchTo().window(originalWindow);
        }
    });
});