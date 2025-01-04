// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: "3dfe519e-c7ca-4a15-b6be-a54c113e1368", // Your Azure AD Application (client) ID
        authority: "https://login.microsoftonline.com/2b9e5221-f6e5-4177-80f9-eecfc6b9e267", // Your Azure AD Tenant ID
        redirectUri: "https://fenago.github.io/courselabs-protected-page/"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// Check if user is already logged in
msalInstance.handleRedirectPromise().then((response) => {
    console.log("Handling redirect promise...");
    if (response !== null && response.account !== null) {
        msalInstance.setActiveAccount(response.account);
        console.log("Logged in user:", response.account.username);
        document.getElementById("welcome-message").innerText = `Welcome, ${response.account.username}`;
    } else {
        const currentAccounts = msalInstance.getAllAccounts();
        console.log("Current accounts:", currentAccounts);
        if (currentAccounts.length === 0) {
            console.log("No accounts found, triggering login...");
            login();
        } else {
            msalInstance.setActiveAccount(currentAccounts[0]);
            console.log("Using existing account:", currentAccounts[0].username);
            document.getElementById("welcome-message").innerText = `Welcome, ${currentAccounts[0].username}`;
        }
    }
}).catch(error => {
    console.error("Error during handleRedirectPromise:", error);
});

// Login function
function login() {
    console.log("Initiating login...");
    msalInstance.loginRedirect({
        scopes: ["user.read"]
    });
}

// Logout function
document.getElementById("logout-btn").addEventListener("click", () => {
    console.log("Initiating logout...");
    msalInstance.logoutRedirect().catch(error => {
        console.error("Error during logoutRedirect:", error);
    });
});

// Stubbed API functions
function startVM() {
    alert("Starting the VM...");
    // Stub for API call to start the VM
}

function stopVM() {
    alert("Stopping the VM...");
    // Stub for API call to stop the VM
}

function restartVM() {
    alert("Restarting the VM...");
    // Stub for API call to restart the VM
}

function deleteVM() {
    alert("Deleting the VM...");
    // Stub for API call to delete the VM
}

function getVMDetails() {
    alert("Fetching VM details...");
    // Stub for API call to get VM details
    // Use Azure API endpoint: /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/instanceView?api-version=2024-07-01
}
