import { ThenableWebDriver } from "selenium-webdriver";
import { BrowserStackRunner } from "./BrowserStack/Runner";
import { LocalRunner } from "./Local/Runner";

export interface Runner {

    eachDevice(block: (it: WebDriverTest) => void): void;
}

const runner = new BrowserStackRunner();
// const runner = new LocalRunner();

type WebDriverTestIteration = (driver: ThenableWebDriver) => Promise<void>;
export type WebDriverTest = (title: string, it: WebDriverTestIteration) => void;

export function eachDevice(block: (it: WebDriverTest) => void) {
    runner.eachDevice(block);
}
