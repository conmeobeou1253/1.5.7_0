const currentUrl = window.location.href;
const compareUrl = "https://www.bing.com/rewards/panelflyout";
// const compareUrl = "https://www.bing.com/rewards/panelflyout?channel=bingflyout&partnerId=BingRewards";
let activity = [];
// dom ready
document.addEventListener("DOMContentLoaded", async () => {
	if (currentUrl.includes(compareUrl)) {
		const links = document.querySelectorAll("a");

		for (const a of links) {
			console.log(a.href);
			if (
				a.childElementCount > 1 &&
				!a.href.includes("bing.com/?form") &&
				!a.href.includes("rewards.bing.com") &&
				!a.closest(".search_earn_card")
			) {
				activity.push(a.href);
			}
		}

		app.runtime.sendMessage({ action: "activity", tabs: activity });

		await delay(3000);
		window.close();
	}

	async function delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
});
