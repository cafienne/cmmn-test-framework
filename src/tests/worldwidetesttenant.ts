import User from "../framework/user";
import TenantUser, { TenantOwner } from "../framework/tenant/tenantuser";
import Tenant from "../framework/tenant/tenant";
import { ServerSideProcessing, SomeTime } from "../framework/test/time";
import PlatformService from "../framework/service/platform/platformservice";
import TenantService from "../framework/service/tenant/tenantservice";

const platformService = new PlatformService();

/**
 * Simple test tenant to avoid duplicate code
 */
export default class WorldWideTestTenant {
    sender = new TenantOwner('sending-user', ['Sender'], 'sender', 'sender@senders.com');
    receiver = new TenantOwner('receiving-user', ['Receiver'], 'receiver', 'receiver@receivers.com')
    employee = new TenantUser('employee', ['Employee'], 'another employee', 'without any email address');
    tenant: Tenant = new Tenant(this.name, [this.sender, this.receiver, this.employee]);

    constructor(public readonly name: string = 'World-Wide-Test-Tenant', public platformAdmin: User = new User('admin')) {

    }

    /**
     * Creates the tenant, and logs in for sender user and receiver user.
     */
    async create() {
        await this.platformAdmin.login();
        const response = await platformService.createTenant(this.platformAdmin, this.tenant);
        if (response.status === 204) {
            await ServerSideProcessing('Giving server time to handle tenant creation');
        } else {
        }
        try {
            await this.sender.login();
        } catch (error) {
            await ServerSideProcessing('Giving server even more time to handle the tenant creation');
            await this.sender.login();
        }
        await this.receiver.login();
        await this.employee.login();
    }
}