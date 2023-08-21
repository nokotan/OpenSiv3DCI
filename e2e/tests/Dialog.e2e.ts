import { ThenableWebDriver, WebElement } from "selenium-webdriver";
import { eachDevice } from "../src/RunnerFactory";
import { expect } from "chai";

const preScript = `
    _siv3dInitDialog();

    let awaken = false;

    window._siv3dMaybeAwake = function() {
        awaken = true;
    };

    window.GetAwaked = function() {
        const retVal = awaken;
        awaken = false;
        return retVal;
    }
    
    window.stackSave = function() {
        return 0;
    };
    window.stackAlloc = function(size) {
        return 0;
    };
    window.stackRestore = function(sp) {};
    window.setValue = function() {
        return 0;
    };
    window.intArrayFromString = function(text) {
        return text;
    };
    window.allocate = function(text) {
        return text;
    };
    Module["_free"] = function() {};

    document.body.appendChild(siv3dInputElement);
`;

async function GetInputElement(driver: ThenableWebDriver) {
    return await driver.executeScript("return siv3dInputElement;") as WebElement;
}

async function GetAwaked(driver: ThenableWebDriver) {
    return await driver.executeScript("return GetAwaked();") as boolean;
}

async function OpenDialog(driver: ThenableWebDriver) {
    return await driver.executeScript("siv3dOpenDialogAsync('', () => {}, 0, false);");
}


eachDevice(function(it) {
    it("Awake after dialog input", async function(driver) {
        await driver.executeScript(preScript);

        const inputElement = await GetInputElement(driver);

        await OpenDialog(driver);
        await inputElement.sendKeys("C:/users/owner/downloads/.gitignore");
        expect(await GetAwaked(driver)).equals(true);
    });

    it("Awake after dialog 2nd input", async function(driver) {
        await driver.executeScript(preScript);

        const inputElement = await GetInputElement(driver);

        await OpenDialog(driver);
        await inputElement.sendKeys("C:/users/owner/downloads/.gitignore");
        await GetAwaked(driver);

        await OpenDialog(driver);
        await inputElement.sendKeys("C:/users/owner/downloads/.gitignore");
        expect(await GetAwaked(driver)).equals(true);
    });

    it("Awake after dialog input cancel", async function(driver) {
        await driver.executeScript(preScript);

        await OpenDialog(driver);
        const inputElement = await GetInputElement(driver);
        await inputElement.clear();
      
        expect(await GetAwaked(driver)).equals(true);
    });
});
