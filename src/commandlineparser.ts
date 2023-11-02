import Config from './config';

export default class CommandLineParser {
    configArguments: Array<string> = process.argv.slice(2);

    constructor() {
        this.parseTimeout();
        this.parseParallellism();
    }

    private parseTimeout() {
        if (this.configArguments.length) {
            const timeout = this.configArguments[0];
            if (! isNaN(Number(timeout)) && timeout.trim() !== '-t') { // Classic style setting timeout
                console.log('Setting CQRS wait time to ' + timeout)
                Config.CafienneService.cqrsWaitTime = Number(timeout);

                // Remove the timeout parameter
                this.configArguments = this.configArguments.slice(1);
            } else {
                Config.CafienneService.cqrsWaitTime = this.readNumber('-t', 'CQRS wait time', Config.CafienneService.cqrsWaitTime, 100);
            }                
        }
    }

    private parseParallellism() {
        Config.CafienneService.cqrsWaitTime = this.readNumber('-p', 'parallellism', Config.TestCase.parallellism, 1);
    }

    private readNumber(setting: string, description: string, defaultValue: number, mininumValue: number): number {
        const hasSetting: number = this.configArguments.indexOf(setting);
        if (hasSetting >= 0) {
            if (this.configArguments.length < hasSetting + 2) {
                throw new Error(`Configuration misses value for ${description} (found ${setting} without a number)`);
            }
            const value = this.configArguments[hasSetting + 1];
            const number = Number(value);
            if (isNaN(number)) {
                throw new Error(`Configuration value for ${description} must be a number (found ${value})`);
            }
            if (number < mininumValue) {
                throw new Error(`Configuration value for ${description} must be at least ${mininumValue} (found ${number})`);
            }
            this.configArguments[hasSetting] = '';
            this.configArguments[hasSetting + 1] = '';
            this.configArguments = this.configArguments.filter(arg => arg.length > 0);
            console.log(`Setting config for ${description} to ${number}`)
            return number;
        } else {
            return defaultValue;
        }
    }

    private readValue(setting: string, description: string, defaultValue: string): string {
        const hasSetting: number = this.configArguments.indexOf(setting);
        if (hasSetting >= 0) {
            if (this.configArguments.length < hasSetting + 2) {
                throw new Error(`Configuration misses value for ${description} (found ${setting} without a value)`);
            }
            const value = this.configArguments[hasSetting + 1];
            this.configArguments[hasSetting] = '';
            this.configArguments[hasSetting + 1] = '';
            this.configArguments = this.configArguments.filter(arg => arg.length > 0);
            return value;
        } else {
            return defaultValue;
        }
    }

    get testNames(): Array<string> {
        return this.configArguments;
    }
}
