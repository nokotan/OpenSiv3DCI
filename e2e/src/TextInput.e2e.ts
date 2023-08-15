import { By, Key, ThenableWebDriver } from "selenium-webdriver";
import { eachDevice } from "./RunnerFactory";
import { expect } from "chai";

const preScript = `
    let inputText = [];

    Module.GetInputText = function() {
        const input = inputText;
        inputText = [];
        return input;
    }

    _siv3dInitTextInput();
    siv3dRegisterTextInputCallback(function(codePoint) {
        inputText.push(codePoint);
    });

    window.UTF8ToString = function(text) {
        return text;
    }
`;

async function GetInputText(driver: ThenableWebDriver) {
    return await driver.executeScript("return Module.GetInputText();") as number[];
}

async function SetTextInputText(driver: ThenableWebDriver, text: string) {
    await driver.executeScript("_siv3dSetTextInputText(arguments[0]);", text);
}

eachDevice(function(it) {
    it("Simple Input", async function(driver) {
        await driver.executeScript(preScript);

        const inputElement = await driver.findElement(By.id("textinput"));
        await inputElement.sendKeys("Siv3D");

        expect(await GetInputText(driver), "Characters should be inputted").deep.equals([ 83, 105, 118, 51, 68 ]);
    });

    it("Backspace", async function(driver) {
        await driver.executeScript(preScript);

        const inputElement = await driver.findElement(By.id("textinput"));
        await inputElement.sendKeys("Siv3D");
        await GetInputText(driver);
        await inputElement.sendKeys(Key.BACK_SPACE);

        expect(await GetInputText(driver), "Characters should be deleted.").deep.equals([ 8 ]);
    });

    it("SetText", async function(driver) {
        await driver.executeScript(preScript);

        await SetTextInputText(driver, "Siv3D");
        const inputElement = await driver.findElement(By.id("textinput"));

        expect(await inputElement.getText(), "Characters should be set.").equals("     ");
    });
});
