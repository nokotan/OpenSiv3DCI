import { By, Key, ThenableWebDriver } from "selenium-webdriver";
import { testIt } from "./Runner";
import { expect } from "chai";
import test from "mocha";
import { Local } from "browserstack-local";

const browserStackLocal = new Local();

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
`;

async function GetInputText(driver: ThenableWebDriver) {
    return await driver.executeScript("return Module.GetInputText();") as number[];
}

const timeout = 1 * 60 * 1000;

test.before(async function() {
    this.timeout(timeout);

    await new Promise<Error | undefined>(resolve => {
        browserStackLocal.start({
            key: process.env.BROWSERSTACK_ACCESS_KEY
        }, resolve);
    });
})

test.after(async function() {
    this.timeout(timeout);
    
    await new Promise<void>(resolve => {
        browserStackLocal.stop(resolve);
    });
})

testIt("TextInput", async function(driver: ThenableWebDriver) {
    await driver.executeScript(preScript);

    const inputElement = await driver.findElement(By.id("textinput"));
    
    await inputElement.sendKeys("Siv3D");

    expect(await GetInputText(driver), "Characters should be inputted").deep.equals([ 83, 105, 118, 51, 68 ]);

    await inputElement.sendKeys(Key.BACK_SPACE);

    expect(await GetInputText(driver), "Characters should be deleted.").deep.equals([ 8 ]);
});
