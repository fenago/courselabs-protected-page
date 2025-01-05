const { DefaultAzureCredential } = require("@azure/identity");
const { ComputeManagementClient } = require("@azure/arm-compute");

module.exports = async function (context, req) {
    const action = req.query.action; // Action: start, stop, restart, delete, getDetails
    const vmName = req.query.vmName;
    const subscriptionId = process.env.SUBSCRIPTION_ID;
    const resourceGroupName = process.env.RESOURCE_GROUP;

    if (!action || !vmName) {
        context.res = {
            status: 400,
            body: "Please provide both 'action' and 'vmName' as query parameters."
        };
        return;
    }

    const credential = new DefaultAzureCredential();
    const client = new ComputeManagementClient(credential, subscriptionId);

    try {
        let result;
        switch (action.toLowerCase()) {
            case "start":
                result = await client.virtualMachines.beginStartAndWait(resourceGroupName, vmName);
                break;
            case "stop":
                result = await client.virtualMachines.beginDeallocateAndWait(resourceGroupName, vmName);
                break;
            case "restart":
                result = await client.virtualMachines.beginRestartAndWait(resourceGroupName, vmName);
                break;
            case "delete":
                result = await client.virtualMachines.beginDeleteAndWait(resourceGroupName, vmName);
                break;
            case "getdetails":
                result = await client.virtualMachines.get(resourceGroupName, vmName, { expand: "instanceView" });
                break;
            default:
                context.res = {
                    status: 400,
                    body: "Invalid action. Valid actions are: start, stop, restart, delete, getDetails."
                };
                return;
        }

        context.res = {
            status: 200,
            body: result
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: `Error performing action '${action}' on VM '${vmName}': ${error.message}`
        };
    }
};
