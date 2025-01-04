// MSAL Configuration
const msalConfig = {
    auth: {
        clientId: "3dfe519e-c7ca-4a15-b6be-a54c113e1368", // Replace with your Azure AD Application (client) ID
        authority: "https://login.microsoftonline.com/2b9e5221-f6e5-4177-80f9-eecfc6b9e267", // Replace with your tenant ID
        redirectUri: "https://fenago.github.io/courselabs-protected-page/"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

// Check if user is already logged in
msalInstance.handleRedirectPromise().then((response) => {
    if (response !== null && response.account !== null) {
        msalInstance.setActiveAccount(response.account);
        document.getElementById("username").innerText = `Welcome, ${response.account.username}`;
    } else {
        const currentAccounts = msalInstance.getAllAccounts();
        if (currentAccounts.length === 0) {
            login();
        } else {
            msalInstance.setActiveAccount(currentAccounts[0]);
            document.getElementById("username").innerText = `Welcome, ${currentAccounts[0].username}`;
        }
    }
}).catch(error => {
    console.error(error);
});

// Login function
function login() {
    msalInstance.loginRedirect({
        scopes: ["user.read"]
    });
}

// Logout function
document.getElementById("logout-btn").addEventListener("click", () => {
    msalInstance.logoutRedirect();
});

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
