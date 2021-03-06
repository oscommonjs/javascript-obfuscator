import * as format from 'string-template';

import { assert } from 'chai';

import { DomainLockNodeTemplate } from '../../../../../src/templates/custom-nodes/domain-lock-nodes/domain-lock-node/DomainLockNodeTemplate';

import { CryptUtils } from '../../../../../src/utils/CryptUtils';

/**
 * @param templateData
 * @param callsControllerFunctionName
 * @param currentDomain
 * @returns {Function}
 */
function getFunctionFromTemplate (templateData: any, callsControllerFunctionName: string,  currentDomain: string) {
    const domainLockTemplate: string = format(DomainLockNodeTemplate(), templateData);

    return Function(`
        document = {
            domain: '${currentDomain}'
        };

        var ${callsControllerFunctionName} = (function(){            
            return function (context, fn){	
                return function () {
                    return fn.apply(context, arguments);
                };
            }
        })();

        ${domainLockTemplate}
    `)();
}

describe('DomainLockNodeTemplate (): string', () => {
    const singleNodeCallControllerFunctionName: string = 'callsController';

    describe('variant #1: current domain matches with `domainsString`', () => {
        const domainsString: string = ['www.example.com'].join(';');
        const currentDomain: string = 'www.example.com';

        let testFunc: () => void;

        before(() => {
            const [
                hiddenDomainsString,
                diff
            ] = CryptUtils.hideString(domainsString, domainsString.length * 3);

            testFunc = () => getFunctionFromTemplate({
                domainLockFunctionName: 'domainLockFunction',
                diff: diff,
                domains: hiddenDomainsString,
                singleNodeCallControllerFunctionName
            }, singleNodeCallControllerFunctionName, currentDomain);
        });

        it('should correctly runs code inside template', () => {
            assert.doesNotThrow(testFunc);
        });
    });

    describe('variant #2: urrent domain matches with base domain of `domainsString` item', () => {
        const domainsString: string = ['www.test.com', '.example.com'].join(';');
        const currentDomain: string = 'subdomain.example.com';

        let testFunc: () => void;

        before(() => {
            const [
                hiddenDomainsString,
                diff
            ] = CryptUtils.hideString(domainsString, domainsString.length * 3);

            testFunc = () => getFunctionFromTemplate({
                domainLockFunctionName: 'domainLockFunction',
                diff: diff,
                domains: hiddenDomainsString,
                singleNodeCallControllerFunctionName
            }, singleNodeCallControllerFunctionName, currentDomain);
        });

        it('should correctly runs code inside template', () => {
            assert.doesNotThrow(testFunc);
        });
    });

    describe('variant #3: current domain doesn\'t match with `domainsString`', () => {
        const domainsString: string = ['www.example.com'].join(';');
        const currentDomain: string = 'www.test.com';

        let testFunc: () => void;

        before(() => {
            const [
                hiddenDomainsString,
                diff
            ] = CryptUtils.hideString(domainsString, domainsString.length * 3);

            testFunc = () => getFunctionFromTemplate({
                domainLockFunctionName: 'domainLockFunction',
                diff: diff,
                domains: hiddenDomainsString,
                singleNodeCallControllerFunctionName
            }, singleNodeCallControllerFunctionName, currentDomain);
        });

        it('should throw an error', () => {
            assert.throws(testFunc);
        });
    });
});
