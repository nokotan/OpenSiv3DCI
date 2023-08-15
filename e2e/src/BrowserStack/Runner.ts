import test from "mocha";
import https from "https";
import { Builder, ThenableWebDriver } from "selenium-webdriver";
import { InspectedPageUrl, WebDriverUrl } from "./Config";
import { Capability, SupportedDeviceConfig } from "./Devices";
import { Runner, WebDriverTest } from "../RunnerFactory";
import { Local } from "browserstack-local";

const browserStackLocal = new Local();
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

function patchUrl(cap: Capability, path: string): string {
    if (cap["bstack:options"].os === "iOS") {
        return path.replace(/localhost/g, "bs-local.com");
    } else {
        return path;
    }
}

async function reportAsPassed(driver: ThenableWebDriver) {
    await driver.executeScript('browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed","reason": "Test Case Passed"}}');
}

async function reportAsFailed(driver: ThenableWebDriver, reason: string) {
    await driver.executeScript(`browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"failed","reason": "${reason}"}}`);
}

export class BrowserStackRunner implements Runner {

    eachDevice(block: (it: WebDriverTest) => void) {

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
                            await driver.get(patchUrl(sharedState.cap, InspectedPageUrl));
                            await it(driver);
                        }
                    });
                });
            });
        });
    }
}
