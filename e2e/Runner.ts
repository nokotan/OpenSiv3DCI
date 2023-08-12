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

type WebDriverTestIteration = (driver: ThenableWebDriver) => Promise<void>;
type WebDriverTest = (title: string, it: WebDriverTestIteration) => void;

const timeout = 1 * 60 * 1000;

export function eachDevice(block: (it: WebDriverTest) => void) {
    SupportedDeviceConfig.forEach(function (cap) {

        test.describe(cap.friendlyBrowserName, async function() {
            this.timeout(timeout);

            const sharedState = {
                cap,
                driver: null as (ThenableWebDriver | null)
            };

            const allTests = this.tests;
            
            this.beforeAll(function() {
                sharedState.driver = buildDriver(sharedState.cap);
            });

            this.afterAll(async function() {
                if (!sharedState.driver) {
                    return;
                }

                try {
                    if (allTests.every(test => test.isPassed())) {
                        await reportAsPassed(sharedState.driver);
                    } else {
                        await reportAsFailed(sharedState.driver, "Some test was failed.");
                    }
                } catch(_) {

                } finally {
                    await sharedState.driver.quit();
                }
            });

            block(function(title, it) {
                test.it(title, async function() {
                    const driver = sharedState.driver;

                    if (driver) {
                        await driver.get(getUrl(sharedState.cap, "Siv3De2eTest.html"));
                        await it(driver);
                    }
                });
            });
        });
    });
}
