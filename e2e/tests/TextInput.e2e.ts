import { By, Key, ThenableWebDriver } from "selenium-webdriver";
import { eachDevice } from "../src/RunnerFactory";
import { expect } from "chai";

const preScript = `
    let inputText = [];

    Module.GetInputText = function() {
        const input = inputText;
        inputText = [];
        return input;
    };

    _siv3dStartUserActionHook();
    _siv3dInitTextInput();

    siv3dRegisterTextInputCallback(function(codePoint) {
        inputText.push(codePoint);
    });

    window.UTF8ToString = function(text) {
        return text;
    };
`;

async function GetInputText(driver: ThenableWebDriver) {
    return await driver.executeScript("return Module.GetInputText();") as number[];
}

async function SetTextInputText(driver: ThenableWebDriver, text: string) {
    await driver.executeScript("_siv3dSetTextInputText(arguments[0]);", text);
}

async function RequestTextInputFocus(driver: ThenableWebDriver, enabled: number) {
    await driver.executeScript("_siv3dRequestTextInputFocus(arguments[0]);", enabled);
}

async function GetTextInputFocused(driver: ThenableWebDriver) {
    return await driver.executeScript("return siv3dGetTextInputFocused();") as boolean;
}

async function GetTextInputCursor(driver: ThenableWebDriver) {
    return await driver.executeScript("return _siv3dGetTextInputCursor();") as number;
}

async function SetTextInputCursor(driver: ThenableWebDriver, index: number) {
    await driver.executeScript("_siv3dSetTextInputCursor(arguments[0]);", index);
}

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

eachDevice(function(it) {
    it("Simple Input", async function(driver) {
        await driver.executeScript(preScript);

        const inputElement = await driver.findElement(By.id("textinput"));
        await inputElement.sendKeys("Siv3D");

        expect(await GetInputText(driver), "Characters should be inputted").deep.equals([ 83, 105, 118, 51, 68 ]);

        await inputElement.sendKeys(Key.BACK_SPACE);

        expect(await GetInputText(driver), "Characters should be deleted.").deep.equals([ 8 ]);
    });

    it("SetText", async function(driver) {
        await driver.executeScript(preScript);

        await SetTextInputText(driver, "Siv3D");
        const inputElement = await driver.findElement(By.id("textinput"));

        expect(await inputElement.getText(), "Characters should be set.").equals("     ");
    });

    it("Focus", async function(driver) {
        await driver.executeScript(preScript);

        const canvasElement = await driver.findElement(By.id("canvas"));
        await RequestTextInputFocus(driver, 1);
        await canvasElement.click();
        await sleep(50);

        expect(await GetTextInputFocused(driver), "Element should be focused").equals(true);

        await RequestTextInputFocus(driver, 0);
        await canvasElement.click();
        await sleep(50);

        expect(await GetTextInputFocused(driver), "Element should be blured").equals(false);
    });

    it("TextSelection", async function(driver) {
        await driver.executeScript(preScript);

        expect(await GetTextInputCursor(driver), "Cursor before text input").equals(0);

        const inputElement = await driver.findElement(By.id("textinput"));
        await inputElement.sendKeys("Siv3D");
        await GetInputText(driver);

        expect(await GetTextInputCursor(driver), "Cursor after text input").equals(5);

        await SetTextInputCursor(driver, 4);

        expect(await GetTextInputCursor(driver), "Cursor after SetTextInputCursor").equals(4);

        await inputElement.sendKeys(Key.DELETE);

        expect(await GetInputText(driver), "Characters should be deleted.").deep.equals([ 0x7F ]);
    });
});
