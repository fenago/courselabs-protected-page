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

    // Simulate fetching initial VM status
    setTimeout(() => updateVMStatus("Running"), 1000); // Example: Set initial status to "Running" after 1 second
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
    updateVMStatus("Starting");
}

function stopVM() {
    alert("Stopping the VM...");
    updateVMStatus("Stopped");
}

function restartVM() {
    alert("Restarting the VM...");
    updateVMStatus("Restarting");
}

function deleteVM() {
    alert("Deleting the VM...");
    updateVMStatus("Deleted");
}

function getVMDetails() {
    alert("Fetching VM details...");
    // Stub for API call to get VM details
    // Use Azure API endpoint: /subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Compute/virtualMachines/{vmName}/instanceView?api-version=2024-07-01
}

// Function to update VM status dynamically
function updateVMStatus(status) {
    const statusElement = document.getElementById("vm-status");
    statusElement.innerText = `VM Status: ${status}`;

    // Update badge color based on status
    switch (status.toLowerCase()) {
        case "running":
            statusElement.className = "badge bg-success";
            break;
        case "starting":
        case "restarting":
        case "deallocating":
            statusElement.className = "badge bg-warning";
            break;
        case "stopped":
        case "deleted":
            statusElement.className = "badge bg-danger";
            break;
        default:
            statusElement.className = "badge bg-secondary";
    }
}
