import test from "mocha";
import http from "http";
import { Runner, WebDriverTest } from "../RunnerFactory";
import { Builder, Capabilities, ThenableWebDriver } from "selenium-webdriver";
import { InspectedPageUrl, WebDriverUrl } from "./Config";

const timeout = 1 * 60 * 1000;

function buildDriver() {
    return new Builder()
        .usingServer(WebDriverUrl)
        .usingHttpAgent(
            new http.Agent({
                keepAlive: true,
                keepAliveMsecs: 30 * 1000
            }))
        .withCapabilities(Capabilities.chrome())
        .build();
};

export class LocalRunner implements Runner {

    eachDevice(block: (it: WebDriverTest) => void): void {
        test.describe("Local Test", async function() {
            this.timeout(timeout);

            const sharedState = {
                driver: null as (ThenableWebDriver | null)
            };
            
            this.beforeAll(function() {
                sharedState.driver = buildDriver();
            });

            this.afterAll(async function() {
                if (!sharedState.driver) {
                    return;
                }

                await sharedState.driver.quit();                
            });

            block(function(title, it) {
                test.it(title, async function() {
                    const driver = sharedState.driver;

                    if (driver) {
                        await driver.get(InspectedPageUrl);
                        await it(driver);
                    }
                });
            });
        });
    }
}