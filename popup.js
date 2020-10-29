chrome.tabs.query(
    {
        active: true,
        lastFocusedWindow: true,
    },
    function (tabs) {
        // and use that tab to fill in out title and url
        let url = tabs[0].url;
        let active = url.includes("fsweb.no/studentweb/resultater.jsf");
        let status = document.getElementById("status");
        if (active) {
            status.innerHTML = "Active";
            status.style = "color: green; display:inline-block;";
        } else {
            status.innerHTML = "Inactive";
            status.style = "color: red; display:inline-block;";
        }
    }
);
