chrome.alarms.onAlarm.addListener(
    () => {
        chrome.notifications.create(
            {
                type: "basic",
                iconUrl: "xxx.jpg", //add jpg for the notif
                title: "Check-In",
                message: "xxx!", //create new custom message function
                silent: false
            },
            () => { }
        )
    },
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.moodNotification) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png", // Ensure this icon path is valid
            title: "Mood Update",
            message: request.moodNotification,
            silent: false
        });
        sendResponse({ success: true });
    }
});



function notifyMood() {
    if (window.currMood) {
        chrome.runtime.sendMessage({ mood: window.currMood }, (response) => {
            console.log('Notification Sent:', response);
        });
    }
}

setInterval(() => {
    notifyMood();
}, 5000); // Trigger every 5 seconds



function createAlarm() {
    chrome.alarms.create(
        "friendly_notif",
        {
            delayInMinutes: 1,
            periodInMinutes: 1
        }
    );
}

if (chrome.runtime && chrome.runtime.sendMessage) {
    console.log("Chrome runtime API is available.");
} else {
    console.error("Chrome runtime API is not accessible.");
}
