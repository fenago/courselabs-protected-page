// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: "3dfe519e-c7ca-4a15-b6be-a54c113e1368", // Your Azure AD Application (client) ID
        authority: "https://login.microsoftonline.com/2b9e5221-f6e5-4177-80f9-eecfc6b9e267", // Your Azure AD Tenant ID
        redirectUri: "https://fenago.github.io/courselabs-protected-page/"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// Function to get the access token for calling Azure Function
async function getAccessToken() {
    const request = {
        scopes: ["https://management.azure.com/user_impersonation"]
    };

    try {
        const response = await msalInstance.acquireTokenSilent(request);
        console.log("Access token acquired silently.");
        return response.accessToken;
    } catch (error) {
        console.warn("Silent token acquisition failed, attempting redirect login.", error);
        return msalInstance.acquireTokenRedirect(request);
    }
}

// Check if user is already logged in
msalInstance.handleRedirectPromise().then((response) => {
    console.log("Handling redirect promise...");
    if (response !== null && response.account !== null) {
        msalInstance.setActiveAccount(response.account);
        console.log("Logged in user:", response.account.username);
        document.getElementById("welcome-message").innerText = `Welcome, ${response.account.username}`;
    } else {
        const currentAccounts = msalInstance.getAllAccounts();
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
async function startVM() {
    displayMessage("Starting the VM...");
    const result = await callAzureFunction("start");
    if (result) displayMessage("VM started successfully.");
}

async function stopVM() {
    displayMessage("Stopping the VM...");
    const result = await callAzureFunction("stop");
    if (result) displayMessage("VM stopped successfully.");
}

async function restartVM() {
    displayMessage("Restarting the VM...");
    const result = await callAzureFunction("restart");
    if (result) displayMessage("VM restarted successfully.");
}

async function deleteVM() {
    displayMessage("Deleting the VM...");
    const result = await callAzureFunction("delete");
    if (result) displayMessage("VM deleted successfully.");
}

async function getVMDetails() {
    displayMessage("Fetching VM details...");
    const result = await callAzureFunction("details");
    if (result) displayMessage(`VM Details: ${JSON.stringify(result)}`);
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

// Function to call Azure Function App API
async function callAzureFunction(action) {
    const functionUrl = `https://vm-control-function.azurewebsites.net/api/controlVM?action=${action}`;
    const token = await getAccessToken();

    try {
        const response = await fetch(functionUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error calling Azure Function: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error calling Azure Function for action ${action}:`, error);
        displayMessage(`Failed to ${action} the VM. Please try again.`, true);
    }
}

// Function to display messages in the UI
function displayMessage(message, isError = false) {
    const messageContainer = document.getElementById("message-container");
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageElement.className = isError ? "alert alert-danger" : "alert alert-success";
    messageContainer.appendChild(messageElement);

    // Automatically remove the message after 5 seconds
    setTimeout(() => messageElement.remove(), 5000);
}
