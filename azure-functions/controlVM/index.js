const { ComputeManagementClient } = require("@azure/arm-compute");
const { DefaultAzureCredential } = require("@azure/identity");

module.exports = async function (context, req) {
    context.log('Received request for VM control.');

    // Extract request parameters
    const action = req.query.action || req.body?.action;
    const resourceGroupName = req.query.resourceGroup || req.body?.resourceGroup;
    const vmName = req.query.vmName || req.body?.vmName;

    if (!action || !resourceGroupName || !vmName) {
        context.res = {
            status: 400,
            body: "Please provide action, resourceGroup, and vmName in the request."
        };
        return;
    }

    const subscriptionId = process.env["SUBSCRIPTION_ID"];
    const credential = new DefaultAzureCredential();
    const client = new ComputeManagementClient(credential, subscriptionId);

    try {
        let result;
        switch (action.toLowerCase()) {
            case 'start':
                result = await client.virtualMachines.beginStartAndWait(resourceGroupName, vmName);
                context.res = { status: 200, body: `VM ${vmName} started successfully.` };
                break;
            case 'stop':
                result = await client.virtualMachines.beginDeallocateAndWait(resourceGroupName, vmName);
                context.res = { status: 200, body: `VM ${vmName} stopped successfully.` };
                break;
            case 'restart':
                result = await client.virtualMachines.beginRestartAndWait(resourceGroupName, vmName);
                context.res = { status: 200, body: `VM ${vmName} restarted successfully.` };
                break;
            case 'delete':
                result = await client.virtualMachines.beginDeleteAndWait(resourceGroupName, vmName);
                context.res = { status: 200, body: `VM ${vmName} deleted successfully.` };
                break;
            case 'details':
                result = await client.virtualMachines.get(resourceGroupName, vmName);
                context.res = { status: 200, body: result };
                break;
            default:
                context.res = { status: 400, body: "Invalid action. Use start, stop, restart, delete, or details." };
        }
    } catch (error) {
        context.log.error("Error controlling VM:", error);
        context.res = {
            status: 500,
            body: `An error occurred: ${error.message}`
        };
    }
};
