import fs from 'fs';
import { DOMParser } from 'xmldom';
import CafienneService from '../cafienneservice';
import DeployCase from './command/repository/deploycase';
import Config from '../../config';
import User from '../../user';
import { checkResponse } from '../response';
import Comparison from '../../test/comparison';
import logger from '../../logger';
import Tenant from '../../tenant/tenant';
import Definitions from '../../cmmn/definitions/definitions';

const FileSystem = fs;

export default class RepositoryService {
    /**
     * Deploy a case model
     * @param command 
     * @param user 
     */
    static async deployCase(user: User, command: DeployCase, expectedStatusCode: number = 204, msg = `Deployment of case ${command.modelName} failed`) {
        if (!user) {
            throw new Error('User must be specified');
        }
        const tenantQueryParameter = command.tenant ? 'tenant=' + command.tenant : '';
        // Hmmm... Duplicate '/repository/repository/' is needed currently...
        const url = `/repository/deploy/${command.modelName}?${tenantQueryParameter}`;
        const response = await CafienneService.postXML(url, user, command.definition);
        return checkResponse(response, msg, expectedStatusCode);
    }

    /**
     * Loads a case definition from the server
     * @param fileName 
     * @param user 
     * @param tenant 
     */
    static async loadCaseDefinition(user: User, fileName: string, tenant: string | Tenant, expectedStatusCode: number = 200) {
        const modelName = fileName.endsWith('.xml') ? fileName.substring(0, fileName.length - 4) : fileName;

        const xml = await CafienneService.getXml(`/repository/load/${modelName}?tenant=${getTenantName(tenant)}`, user);
        return xml;
    }

    /**
     * Fetch cases for the user
     * @param tenant 
     * @param user 
     */
    static async listCaseDefinitions(user: User, tenant?: string | Tenant, expectedStatusCode: number = 200, msg = `ListCaseDefinitions is not expected to succeed for member ${user}`) {
        const tenantQueryParameter = tenant ? '?tenant=' + getTenantName(tenant) : '';
        const response = await CafienneService.get(`/repository/list${tenantQueryParameter}`, user);
        const json = checkResponse(response, msg, expectedStatusCode);

        if (Config.RepositoryService.log) {
            logger.debug('Cases deployed in the server: ' + JSON.stringify(json, undefined, 2))
        }
        return json;
    }

    /**
     * Invokes the validation API
     * @param source 
     */
    static async validateCaseDefinition(user: User, source: Document | string | Definitions, expectedStatusCode: number = 200) {
        const url = `/repository/validate`;
        const xml = readLocalXMLDocument(source);
        const response = await CafienneService.postXML(url, user, xml);
        const status = response.status;
        if (status !== expectedStatusCode) {
            if (response.ok) {
                const responseText = await response.text();
                throw new Error(`Expected status ${expectedStatusCode} instead of ${status} ${response.statusText}: ${responseText}`);
            } else {
                const messages = <Array<string>>await response.json();
                throw new Error(`Validation failed: ${response.statusText}\n${messages.join('\n')}`);
            }
        } else {
            if (response.ok) {
                return response;
            } else {
                const messages = <Array<string>>await response.json();
                return messages;
            }
        }
    }

    /**
     * Combines validation and deployment call in one shot, based on the name of a locally available file
     * @param fileName File containing the case definitions.
     * @param user User that deploys the case definition.
     * @param tenant Tenant in which the definition is deployed.
     */
    static async validateAndDeploy(user: User, fileName: string, tenant: string | Tenant) {
        const tenantName = tenant instanceof Tenant ? tenant.name : tenant;
        const definition = readLocalXMLDocument(fileName);
        const modelName = fileName;

        const serverVersion = await this.loadCaseDefinition(user, modelName, tenantName);
        if (Comparison.sameXML(definition, serverVersion)) {
            if (Config.RepositoryService.log) {
                logger.debug(`Skipping deployment of ${fileName}, as server already has it`);
            }
            return;
        }

        await this.validateCaseDefinition(user, definition);
        await this.deployCase(user, { definition, modelName, tenant: tenantName })
    }
}

/**
 * Parses a file name into an XML document.
 * Reads the file from the configured location on the local system (where this testcase runs)
 * @param fileName 
 */
export function readLocalXMLDocument(content: any): Document {
    if (content.constructor.name == 'Document') {
        return content;
    }
    const parser = new DOMParser();
    return parser.parseFromString(readLocalFile(content), 'application/xml');
}

/**
 * Parses a file name into an XML document.
 * Reads the file from the configured location on the local system (where this testcase runs)
 * @param content If it is an XML Document, then nothing. If it is a file or Definitions, then it will be added as string to compose filename 
 */
export function readLocalFile(content: any): string {
    if (content.constructor.name == 'Document') {
        return content;
    }
    if (!FileSystem.existsSync(Config.RepositoryService.repository_folder)) {
        throw new Error(`The configured repository folder '${Config.RepositoryService.repository_folder}' cannot be found`);
    }
    const fileName = Config.RepositoryService.repository_folder + '/' + content;
    if (!FileSystem.existsSync(fileName)) {
        throw new Error(`File ${fileName} cannot be found on the local file system`);
    }
    return FileSystem.readFileSync(fileName, 'utf8');
}

function getTenantName(tenant: Tenant | string) {
    return tenant instanceof Tenant ? tenant.name : tenant;
}