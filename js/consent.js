const app = chrome || browser;

let config = {
	searchDesk: 20,
	searchMob: 10,
	searchMin: 15,
	searchMax: 45,
	scheduleDesk: 3,
	scheduleMob: 3,
	scheduleMin: 15,
	scheduleMax: 45,
	scheduleDefault: "scheduleT1",
	isRunning: false,
	userConsent: false,
	patch: false,
	niche: "random",
};

$(document).ready(async function() {
    $("body").css("--scale", screen.width / 1920);
    const $agree = $("#agree");
    const $disagree = $("#disagree");
    let redirect = false;
    const storage = await app.storage.local.get("config");
    config = { ...config, ...storage.config };
    console.log(config);
    if (config.userConsent) {
        $agree.addClass("selected").text("Agreed");
    } else {
        $disagree.addClass("selected");
    }
    $agree.click(async function() {
        config.userConsent = true;
        await app.storage.local.set({ config });
        $agree.addClass("selected").text("Agreed");
        $disagree.removeClass("selected");
        setTimeout(() => {
            redirect = config.userConsent;
            if (redirect) {
                window.location.href = "/popup.html";
            }
        }, 1000);
    });
    $disagree.click(async function() {
        config.userConsent = false;
        await app.storage.local.set({ config });
        $disagree.addClass("selected");
        $agree.removeClass("selected").text("Agree");
    });
});