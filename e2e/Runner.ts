import test from "mocha";
import https from "https";
import { Builder, ThenableWebDriver } from "selenium-webdriver";
import { WebDriverUrl } from "./Config";
import { Capability, SupportedDeviceConfig } from "./Devices";

function buildDriver(caps: Capability) {
    return new Builder()
        .usingServer(WebDriverUrl)
        .usingHttpAgent(
            new https.Agent({
                keepAlive: true,
                keepAliveMsecs: 30 * 1000
            }))
        .withCapabilities(caps)
        .build();
};

function getUrl(cap: Capability, path: string): string {
    if (cap["bstack:options"].os === "iOS") {
        return "http://bs-local.com:8080/" + path;
    } else {
        return "http://localhost:8080/" + path;
    }
}

async function reportAsPassed(driver: ThenableWebDriver) {
    await driver.executeScript('browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Test Case Passed"}}');
}

async function reportAsFailed(driver: ThenableWebDriver, reason: string) {
    await driver.executeScript(`browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "${reason}"}}`);
}

export function testIt(title: string, testCase: (driver: ThenableWebDriver) => Promise<void>) {
    SupportedDeviceConfig.forEach(function (cap) {
        test.it(title, async function() {
            this.timeout(60 * 1000);
            
            const driver = buildDriver(cap);
            await driver.get(getUrl(cap, "Siv3De2eTest.html"));

            try {
                await testCase(driver);
                await reportAsPassed(driver);
            } catch (e) {
                if (e instanceof Error) {
                    await reportAsFailed(driver, e.message);
                }
            } finally {
                await driver.quit();
            }
        });
    });
}
