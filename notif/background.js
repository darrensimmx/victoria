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
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request);
        if (request.time)
            createAlarm();

        sendResponse(() => {
            return false
        });
    }
);

function createAlarm() {
    chrome.alarms.create(
        "friendly_notif",
        {
            delayInMinutes: 1,
            periodInMinutes: 1
        }
    );
}