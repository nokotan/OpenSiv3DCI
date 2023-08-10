const projectCapability: ProjectOptions = {
    'buildName': process.env.BROWSERSTACK_BUILD_NAME,
    'projectName': process.env.BROWSERSTACK_PROJECT_NAME,
    'userName': process.env.BROWSERSTACK_USERNAME,
    'accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
    'seleniumVersion': "3.5.2",

    'local': "true",
}

interface ProjectOptions {
    buildName: string | undefined;
    projectName: string | undefined;
    userName: string | undefined;
    accessKey: string | undefined;

    seleniumVersion: string;
    local: string;
}

interface ProjectCapability {
    "bstack:options": ProjectOptions;
    friendlyBrowserName: string;
}

export type Capability = ProjectCapability & DeciceCapability;

interface MobileOptions {
    os: "android" | "iOS",
    realMobile: string,
    deviceName: string,
    osVersion: string,
}

interface DesktopOptions {
    os: "Windows" | "OS X";
    osVersion: string;
    browserVersion: string;
}

interface DeciceCapability {
    "bstack:options": MobileOptions | DesktopOptions;
    browserName: string;
}

const deviceCapabilities: DeciceCapability[] = [
    {
        'browserName': 'Chrome',
        "bstack:options": {
            'os': 'Windows',
            'osVersion': '10',
            'browserVersion': '105'
        },
    },
    {
        "bstack:options": {
            'os' : 'Windows',
            'osVersion' : '10',
            'browserVersion' : '105',
        },
        'browserName' : 'Edge',
    },
    {
        "bstack:options": {
            'os' : 'OS X',
            'osVersion' : 'Monterey',
            'browserVersion' : '15'
        },
        'browserName' : 'Safari',
    },
    {
        "bstack:options": {
            'os' : 'OS X',
            'osVersion' : 'Monterey',
            'browserVersion' : '105',
        },
        'browserName' : 'Chrome',
    },
    {
        "bstack:options": {
            'os' : 'OS X',
            'osVersion' : 'Monterey',
            'browserVersion' : '105',
        },
        'browserName' : 'FireFox',
    },
    {
        "bstack:options": {
            'os' : 'android',
            "realMobile" : "true",
            'deviceName' : 'Google Pixel 6',
            'osVersion' : '12.0',
        },
        'browserName' : 'Chrome',
    },
    {
        "bstack:options": {
            'os' : 'android',
            "realMobile" : "true",
            'deviceName' : 'Google Pixel 6',
            'osVersion' : '12.0',
        },
        'browserName' : 'FireFox',
    },
    {
        "bstack:options": {
            'os' : 'android',
            "realMobile" : "true",
            'deviceName' : 'Samsung Galaxy S9 Plus',
            'osVersion' : '8.0',
        },
        'browserName' : 'Chrome',
    },
    {
        "bstack:options": {
            'os' : 'android',
            "realMobile" : "true",
            'deviceName' : 'Samsung Galaxy S21',
            'osVersion' : '11.0',
        },
        'browserName' : 'Chrome',
    },
    {
        "bstack:options": {
            'os' : 'iOS',
            "realMobile" : "true",
            'deviceName' : 'iPhone 11',
            'osVersion' : '15',
        },
        'browserName' : 'Safari',
    },
    {
        "bstack:options": {
            'os' : 'iOS',
            "realMobile" : "true",
            'deviceName' : 'iPhone 11',
            'osVersion' : '15',
        },
        'browserName' : 'Chrome',
    },
    {
        "bstack:options": {
            'os' : 'iOS',
            "realMobile" : "true",
            'deviceName' : 'iPhone XS',
            'osVersion' : '15',
        },
        'browserName' : 'Safari',
    },
    {
        "bstack:options": {
            'os' : 'iOS',
            "realMobile" : "true",
            'deviceName' : 'iPad 9th',
            'osVersion' : '15',
        },
        'browserName' : 'Safari',
    },
];

const notSupportedDeviceCapabilities: DeciceCapability[] = [
    {
        "bstack:options": {
            'os' : 'iOS',
            "realMobile" : "true",
            'deviceName' : 'iPhone 11',
            'osVersion' : '14',
        },
        'browserName' : 'Safari'
    },
    {
        "bstack:options": {
            'os' : 'Windows',
            'osVersion' : '10',
            'browserVersion' : '105'
        },
        'browserName' : 'Firefox',
    },
    {
        "bstack:options": {
            'os' : 'OS X',
            'osVersion' : 'Big Sur',
            'browserVersion' : '14',
        },
        'browserName' : 'Safari',
    },
];

function generateCapability(cap: DeciceCapability): Capability {
    const copied = Object.assign({}, cap);
    const options = Object.assign(copied["bstack:options"], projectCapability);

    const capability = Object.assign({ friendlyBrowserName: "", browserName: copied.browserName },  { "bstack:options": { ...options } });

    if (capability["bstack:options"].os === "Windows" || capability["bstack:options"].os === "OS X") {
        capability.friendlyBrowserName = `${capability["bstack:options"].os} ${capability["bstack:options"].osVersion}, ${capability.browserName} ${capability["bstack:options"].browserVersion}`;
    } else if (capability["bstack:options"].os === "android" || capability["bstack:options"].os === "iOS") {
        capability.friendlyBrowserName = `${capability["bstack:options"].deviceName} ${capability.browserName}`;
    }

    return capability;
}

export const SupportedDeviceConfig = deviceCapabilities.map(generateCapability);
export const NotSupportedDeviceConfig = notSupportedDeviceCapabilities.map(generateCapability);