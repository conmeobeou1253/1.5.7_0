import { a, r } from "/js/gr.js";
const app = chrome || browser;

let config = {
	searchDesk: 10,
	searchMob: 0,
	searchMin: 15,
	searchMax: 45,
	scheduleDesk: 3,
	scheduleMob: 3,
	scheduleMin: 15,
	scheduleMax: 45,
	scheduleDefault: "scheduleT1",
	deviceName: "",
	deviceUserAgent: "",
	deviceWidth: 390,
	deviceHeight: 844,
	deviceScaleFactor: 3,
	isRunning: false,
	userConsent: false,
	patch: false,
	niche: "random",
};
let pro = {
	key: "always-pro-key",
	seats: 1,
};
let automatedTabId = null;
let isMobile = false;
let isActivity = false;
let simulatedTabs = [];
let totalSearches = 0;
let searchesCompleted = 0;
let activity = [];

// On Install initialize the extension with default configuration
app.runtime.onInstalled.addListener(async (e) => {
	if (e.reason === "install") {
		await app.storage.local.set({ config });
		app.tabs.create({
			url: "https://getprojects.notion.site/Privacy-Policy-Rewards-Search-Automator-1986977bedc08080a1d2e3a70dcb29e5",
		});
		// app.tabs.create({
		// 	url: "https://impactbro.com/ref/install?extension=Rewards%20Search%20Automator&ref=EXT-2969668",
		// });
	}
	if (e.reason === "update") {
		// app.tabs.create({
		// 	url: "https://getprojects.notion.site/Privacy-Policy-Rewards-Search-Automator-1986977bedc08080a1d2e3a70dcb29e5",
		// });
		// Fetch required values first
		const { config: storedConfig } =
			(await app.storage.local.get("config")) || {};
		const { isShown } = (await app.storage.local.get("isShown")) || {
			isShown: false,
		};

		await reverify();

		// Merge stored config before clearing
		if (storedConfig !== undefined) {
			config = { ...config, ...storedConfig };
		}

		await app.storage.local.clear(); // Now it's safe to clear

		config.isRunning = false;

		await app.storage.local.set({ config }); // Restore config safely

		// if (!isShown) {
		// 	app.tabs.create({
		// 		url: "https://impactbro.com/ref/?extension=Rewards%20Search%20Automator&ref=EXT-2969667",
		// 	});
		// 	await app.storage.local.set({ isShown: true });
		// } else {
			// await app.storage.local.remove({ isShown });
		// }
	}
	// if (e.reason === "uninstall") {
	// 	app.tabs.create({
	// 		url: "https://impactbro.com/ref/uninstall?extension=Rewards%20Search%20Automator&ref=EXT-2976750",
	// 	});
	// }
});

async function reverify() {
	pro = { key: "always-pro-key", seats: 1 };
	await app.storage.sync.set({ pro });
}

app.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (tabId === automatedTabId && config.isRunning) {
		const tabInfo = await app.tabs.get(tabId);
		if (tabInfo.discarded) {
			// Check if the tab is frozen/discarded
			await app.tabs.update(tabId, { active: true });
		}
	}
	if (changeInfo.status === "complete" &&
		config.patch &&
		config.isRunning &&
		(tab.url.includes("https://www.bing.com") ||
			tab.url.includes("https://rewards.bing.com") ||
			tab.url.includes("https://account.microsoft.com") ||
			tab.url.includes("https://login.live.com")) &&
			tabId !== automatedTabId &&
			!isActivity
	) {
		console.log("%cA Bing page was opened at tab: " + tabId, "color:red");
		app.notifications.create({
			type: "basic",
			iconUrl: "/ico/128.png",
			title: "Bing Rewards Search Automator",
			message: "Please do not open Bing/Microsoft pages manually while the automation is running with Patch enabled on other tabs.",
		});
	}
});

// Handle Pause
async function pause(timeInMs) {
    return new Promise((resolve) => {
        const start = Date.now();
        const interval = setInterval(() => {
            if (!config.isRunning || Date.now() - start >= timeInMs) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

// Fetch the storage data
async function fetchStorage() {
	const data = await app.storage.local.get("config");
	config = { ...config, ...data.config };
	// Removed forced tech niche and patch mobile
	// config.niche = "tech";
	// config.patch = true;
	await app.storage.local.set({ config });
	// Force pro mode
	pro = { key: "always-pro-key", seats: 1 };
	await app.storage.sync.set({ pro });
}

// Hàm tạo/cập nhật alarm schedule
async function setupScheduleAlarm() {
    await fetchStorage();
    await app.alarms.clear("schedule");
    if (config.scheduleDefault === "scheduleT3") {
        // 5-6 phút
        const period = 0 + Math.random(); // 5-6 phút
        app.alarms.create("schedule", { periodInMinutes: period });
        console.log("[Schedule] Đã tạo alarm lặp lại mỗi", period, "phút");
    } else if (config.scheduleDefault === "scheduleT4") {
        // 15-17.5 phút
        const period = 15 + Math.random() * 2.5; // 15-17.5 phút
        app.alarms.create("schedule", { periodInMinutes: period });
        console.log("[Schedule] Đã tạo alarm lặp lại mỗi", period, "phút");
    } else {
        // Không lặp lại
        await app.alarms.clear("schedule");
        console.log("[Schedule] Đã tắt alarm schedule");
    }
}

// Startup function
app.runtime.onStartup.addListener(async () => {
	await fetchStorage();
	await reverify();
	await setupScheduleAlarm();
	if (config.userConsent && pro.key !== "") {
		if (config.scheduleDefault !== "scheduleT1") {
			config.isRunning = true;
			await app.storage.local.set({ config });
			await pause(5000);
			console.log("%cStartup schedule triggered", "color:orange");
			app.tabs.create({
				url: "https://www.bing.com/rewards/panelflyout?channel=bingflyout&partnerId=BingRewards",
			});
			await initialise(
				config.scheduleDesk,
				config.scheduleMob,
				config.scheduleMin,
				config.scheduleMax,
			);
			await setupScheduleAlarm();
		} else {
			config.isRunning = false;
			await app.storage.local.set({ config });
		}
	}
});

async function debug(tabId) {
	try {
		await app.debugger.attach({ tabId: tabId }, "1.2", async function () {
			// Set Emulation.setDeviceMetricsOverride
			await app.debugger.sendCommand(
				{ tabId: tabId },
				"Emulation.setDeviceMetricsOverride",
				{
					mobile: true,
					fitWindow: true,
					width: config.deviceWidth,
					height: config.deviceHeight,
					deviceScaleFactor: config.deviceScaleFactor,
				},
			);
			// Set Network.setUserAgentOverride
			await app.debugger.sendCommand(
				{ tabId: tabId },
				"Network.setUserAgentOverride",
				{
					userAgent: config.deviceUserAgent,
					deviceScaleFactor: config.deviceScaleFactor,
				},
			);
			// Set Emulation.setUserAgentOverride
			await app.debugger.sendCommand(
				{ tabId: tabId },
				"Emulation.setUserAgentOverride",
				{
					userAgent: config.deviceUserAgent,
				},
			);
			// Set Network.setByPassServiceWorker
			await app.debugger.sendCommand(
				{ tabId: tabId },
				"Network.setBypassServiceWorker",
				{
					bypass: true,
				},
			);
			// Set Emulation.setTouchEmulationEnabled
			await app.debugger.sendCommand(
				{ tabId: tabId },
				"Emulation.setTouchEmulationEnabled",
				{
					enabled: true,
					configuration: "mobile",
					maxTouchPoints: 10,
				},
			);
			// Set Emulation.setEmitTouchEventsForMouse
			await app.debugger.sendCommand(
				{ tabId: tabId },
				"Emulation.setEmitTouchEventsForMouse",
				{
					enabled: true,
					configuration: "mobile",
				},
			);
			// Reload the page and wait for 3 seconds
			await app.debugger
				.sendCommand({ tabId: tabId }, "Page.reload")
				.then(async () => {
					await pause(3000);
				});

			console.log(`Debugger attached to tab ${tabId}`);
		});
	} catch (error) {
		console.error(`Failed to detach debugger from tab ${tabId}:`, error);
	}
}

async function detach(tabId) {
	try {
        if (!(await app.debugger.getTargets()).some(t => t.tabId === tabId)) {
            console.warn(`Debugger not attached to tab ${tabId}`);
            return;
        }
		// Reset Emulation settings
		await app.debugger.sendCommand(
			{ tabId: tabId },
			"Emulation.clearDeviceMetricsOverride",
		);
		await app.debugger.sendCommand(
			{ tabId: tabId },
			"Network.setUserAgentOverride",
			{ userAgent: "" },
		);
		await app.debugger.sendCommand(
			{ tabId: tabId },
			"Emulation.setUserAgentOverride",
			{ userAgent: "" },
		);
		await app.debugger.sendCommand(
			{ tabId: tabId },
			"Network.setBypassServiceWorker",
			{ bypass: false },
		);
		await app.debugger.sendCommand(
			{ tabId: tabId },
			"Emulation.setTouchEmulationEnabled",
			{ enabled: false },
		);
		await app.debugger.sendCommand(
			{ tabId: tabId },
			"Emulation.setEmitTouchEventsForMouse",
			{ enabled: false }
		);

		// Detach debugger
		await app.debugger.detach({ tabId: tabId });
		await pause(3000);
		// reload the tab
		await app.tabs.reload(tabId);

		console.log(`Debugger detached from tab ${tabId}`);
	} catch (error) {
		console.error(`Failed to detach debugger from tab ${tabId}:`, error);
	}
}

// Inject content script để clear localStorage/sessionStorage trên Bing
async function clearBingStorageWithContentScript(tabId) {
    try {
        await app.scripting.executeScript({
            target: { tabId: tabId },
            func: () => {
                try {
                    window.localStorage.clear();
                    window.sessionStorage.clear();
                    console.log("Cleared localStorage and sessionStorage from content script!");
                } catch (e) {
                    console.error("Error clearing storage:", e);
                }
            }
        });
    } catch (e) {
        console.error("Failed to inject content script for clearing storage:", e);
    }
}

// Patch Bing: clear cookies, cache, localStorage, serviceWorkers, pluginData
async function patch() {
	const origin = ["https://www.bing.com"];
	// 1. Dùng browsingData
	await app.browsingData.remove(
		{
			origins: origin,
			since: 0,
		},
		{
			cacheStorage: true,
			localStorage: true,
			serviceWorkers: true,
			pluginData: true,
			cookies: true,
		},
	);
	// 2. Dùng cookies API để xóa từng cookie
	if (chrome && chrome.cookies) {
		chrome.cookies.getAll({ domain: "bing.com" }, function(cookies) {
			for (let cookie of cookies) {
				let url = (cookie.secure ? "https://" : "http://") + cookie.domain.replace(/^\./, "") + cookie.path;
				chrome.cookies.remove({
					url: url,
					name: cookie.name,
					storeId: cookie.storeId
				});
			}
		});
	}
	// 3. Reload lại tab như cũ
	await app.tabs.update(automatedTabId, {
		url: "https://rewards.bing.com/",
	});
	await pause(3000);
	await app.tabs.update(automatedTabId, {
		url: "https://www.bing.com/",
	});
	await pause(3000);
	await app.tabs.reload(automatedTabId);
	await pause(4000);
	// 4. Inject content script để clear localStorage/sessionStorage
	await clearBingStorageWithContentScript(automatedTabId);
	// 5. Inject script xóa cookies toàn diện bằng document.cookie
	try {
		await app.scripting.executeScript({
			target: { tabId: automatedTabId },
			func: () => {
				(function () {
					var cookies = document.cookie.split("; ");
					for (var c = 0; c < cookies.length; c++) {
						var d = window.location.hostname.split(".");
						while (d.length > 0) {
							var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
							var p = location.pathname.split('/');
							document.cookie = cookieBase + '/';
							while (p.length > 0) {
								document.cookie = cookieBase + p.join('/');
								p.pop();
							}
							d.shift();
						}
					}
				})();
			}
		});
	} catch (e) {
		console.warn("Failed to inject full cookie clear script:", e);
	}
	console.log("Patched Bing, cleared cookies, localStorage, sessionStorage, sending login trigger message");
	await app.tabs.sendMessage(automatedTabId, { action: "triggerLoginAfterPatch" });
}

// Search automation
async function search(searches, min, max) {
	if (config.patch) {
		await patch();
	}
	for (let i = 0; i < searches; i++) {
		if (!config.isRunning) {
			console.log("%cSearch aborted by User", "color:red");
			break;
		}
		searchesCompleted++;
		const percentage = Math.floor(
			(searchesCompleted / totalSearches) * 100,
		);
		const delay = Math.floor(Math.random() * (max - min + 1) + min) * 1000;
		if (isMobile) {
			console.log(
				`%cMobile search ${i + 1} of ${searches} with ${
					delay / 1000
				} seconds delay`,
				"color:yellow",
			);
		} else {
			console.log(
				`%cDesktop search ${i + 1} of ${searches} with ${
					delay / 1000
				} seconds delay`,
				"color:yellow",
			);
		}

		await pause(3000);
		await app.tabs.sendMessage(automatedTabId, {
			action: "query",
			niche: config.niche,
			index: i,
		});
		let intervalId = setInterval(async () => {
			if (!config.isRunning) return;
			await app.tabs.sendMessage(automatedTabId, { keepContent: true });
			await app.storage.local.set({ automatedTabId });
		}, 5000);
		await pause(delay - 6000);
		let response = await app.tabs.sendMessage(automatedTabId, {
			action: "searchPerform",
			index: i,
		});
		if (response) {
			console.log(
				"%cSearch performed successfully: " + response.query,
				"color:green",
			);
			await app.action.setBadgeText({ text: `${percentage}%` });
			await pause(100);
		} else {
			console.log("%cFailed to send message to tab!", "color:red");

			await app.tabs.reload(automatedTabId);
			await app.tabs.update(automatedTabId, {
				active: true,
			});
			await pause(3000);
			searchesCompleted--;
			i--;
		}
		// Wait after last search
		if (i === searches - 1) {
			console.log("%cWaiting for search complete", "color:blue");
			await pause(delay);
		} else {
			await pause(3000);
		}
		clearInterval(intervalId);
	}
}

// Automate the activity
async function automateActivity(activities) {
	if (activities.length === 0) return;
	isActivity = true;
	await app.action.setBadgeText({ text: "+" });

	// Create a tab with the dashboard link
	const dashboard = await app.tabs.create({
		url: "https://rewards.bing.com/",
	});
	await pause(3000);
	const activitiesTab = parseInt(dashboard.id);

	for (let i = 0; i < activities.length; i++) {
		config.isRunning = true;
		await app.storage.local.set({ config });

		const delay = Math.floor(Math.random() * (30000 - 15000) + 15000);

		// Send a message to the tab
		await app.tabs.sendMessage(activitiesTab, {
			action: "activity",
			url: activities[i],
		});

		// Wait for the activity to be completed
		await pause(delay);

		// Get all active tabs to find the one that was newly opened
		const tabs = await app.tabs.query({});

		// Identify any new tab that was created (not the main dashboard tab)
		const newActivityTab = tabs.find(
			(tab) =>
				tab.id !== activitiesTab && tab.url.includes(activities[i]),
		);

		// If a new tab was opened, close it
		if (newActivityTab) {
			await app.tabs.remove(newActivityTab.id);
		}

		// Update the original tab back to the dashboard
		await app.tabs.update(activitiesTab, {
			url: "https://rewards.bing.com/",
		});

		await pause(3000);
	}

	// Close the main dashboard tab at the end
	await app.tabs.remove(activitiesTab);

	activities.length = 0;
	config.isRunning = false;
	isActivity = false;
	await app.storage.local.set({ config });
}

// Initialize the automation
async function initialise(desk, mob, min, max) {
	totalSearches = 0;
	searchesCompleted = 0;
	if (!config.userConsent) {
		return;
	}
	// Removed forced tech niche and patch mobile
	// config.niche = "tech";
	// config.patch = true;
	await app.storage.local.set({ config });
	// Clear any existing alarms for schedules
	// await app.alarms.clear("schedule"); // ĐÃ XÓA DÒNG NÀY
	// Confirm if the number of searches are valid
	// if (desk < 1 && mob < 1) {
	// 	config.isRunning = false;
	// 	await app.storage.local.set({ config });
	// 	return;
	// }
	// Set the total searches
	totalSearches = desk + mob;
	// Start the automation
	config.isRunning = true;
	await app.storage.local.set({ config });

	// Set a progress percentage badge text on extension icon
	await app.action.setBadgeText({ text: "0%" });
	await app.action.setBadgeTextColor({ color: "#FFFFFF" });
	await app.action.setBadgeBackgroundColor({ color: "#0072FF" });

	if (desk > 0 && config.isRunning) {
		const tab = await app.tabs.create({ url: "https://www.bing.com" });
		automatedTabId = parseInt(tab.id);
		await app.tabs.update(automatedTabId, {
			autoDiscardable: false,
		});
		await pause(3000);
		await search(desk, min, max);
		if (mob > 0 && config.isRunning) {
			isMobile = true;
			await debug(automatedTabId);
			await search(mob, min, max);
			await detach(automatedTabId);
			if (config.patch) {
				await patch();
			}
			isMobile = false;
		}
	}
	if (desk === 0 && mob > 0 && config.isRunning) {
		const tab = await app.tabs.create({ url: "https://www.bing.com" });
		automatedTabId = parseInt(tab.id);
		await app.tabs.update(automatedTabId, {
			autoDiscardable: false,
		});
		await pause(3000);
		isMobile = true;
		await debug(automatedTabId);
		await search(mob, min, max);
		await detach(automatedTabId);
		if (config.patch) {
			await patch();
		}
		isMobile = false;
	}
	if (config.isRunning && pro.key !== "" && activity.length > 0) {
		await automateActivity(activity);
	}

	await app.action.setBadgeText({ text: "" });
	config.isRunning = false;
	await app.storage.local.set({ config });
	searchesCompleted = 0;
	totalSearches = 0;

	// Confirm if the number of searches are valid
	if (desk < 1 && mob < 1) {
		config.isRunning = false;
		await app.storage.local.set({ config });
		// send a msg to popup to update the ui
		app.runtime.sendMessage({ action: "updateUI" });
		// Đóng tab tự động nếu còn tồn tại
		if (automatedTabId) {
			try {
				await app.tabs.remove(automatedTabId);
			} catch (e) {
				console.warn("Failed to close automated tab:", e);
			}
			automatedTabId = null;
		}
		return;
	}
	// Removed: opening rewards.bing.com, moreTools, or panelflyout tabs for both desktop and mobile search.
	// Đóng tab tự động nếu còn tồn tại
	if (automatedTabId) {
		try {
			await app.tabs.remove(automatedTabId);
		} catch (e) {
			console.warn("Failed to close automated tab:", e);
		}
		automatedTabId = null;
	}
}

// Ghi log mỗi lần schedule chạy
async function logScheduleRun() {
    const now = new Date().toISOString();
    const { scheduleLogs = [] } = await app.storage.local.get("scheduleLogs");
    scheduleLogs.push(now);
    // Giới hạn log, ví dụ chỉ lưu 100 lần gần nhất
    if (scheduleLogs.length > 100) scheduleLogs.shift();
    await app.storage.local.set({ scheduleLogs });
    console.log("[Schedule] Đã ghi log chạy lúc:", now);
}

// Kiểm tra log để phát hiện schedule không chạy đúng giờ và tự động sửa
async function checkScheduleHealth() {
    const { scheduleLogs = [] } = await app.storage.local.get("scheduleLogs");
    if (scheduleLogs.length === 0) return;
    const lastRun = new Date(scheduleLogs[scheduleLogs.length - 1]);
    const now = new Date();
    // Lấy period hiện tại
    let period = 6; // mặc định 6 phút
    if (config.scheduleDefault === "scheduleT3") period = 6;
    if (config.scheduleDefault === "scheduleT4") period = 18;
    // Nếu lần chạy gần nhất cách hiện tại > 2 lần period, coi như schedule bị lỗi
    if ((now - lastRun) / 60000 > period * 2) {
        // Gửi notification
        app.notifications.create({
            type: "basic",
            iconUrl: "/ico/128.png",
            title: "Schedule Warning",
            message: "Schedule không chạy đúng giờ, sẽ tự động khởi động lại.",
        });
        // Tạo lại alarm
        await setupScheduleAlarm();
        console.log("[Schedule] Đã tự động tạo lại alarm do phát hiện schedule không chạy đúng giờ");
    }
}

// Handle the schedule alarm
app.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === "schedule") {
		await logScheduleRun(); // Ghi log mỗi lần schedule chạy
		await checkScheduleHealth(); // Kiểm tra log và tự động sửa nếu cần
		await fetchStorage();
		if (
			config.userConsent &&
			config.scheduleDefault !== "scheduleT1" &&
			config.scheduleDefault !== "scheduleT2"
		) {
			console.log("%cSchedule alarm triggered", "color:orange");
			await initialise(
				config.scheduleDesk,
				config.scheduleMob,
				config.scheduleMin,
				config.scheduleMax,
			);
		}
	}
});

// Handle the messages from the popup
app.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	console.log("Message detected:", message);
	await fetchStorage();
	if (message.action === "search") {
		// app.tabs.create({
		// 	url: "https://www.bing.com/rewards/panelflyout?channel=bingflyout&partnerId=BingRewards",
		// });
		await initialise(
			config.searchDesk,
			config.searchMob,
			config.searchMin,
			config.searchMax,
		);
	}
	if (message.action === "stop") {
		config.isRunning = false;
		await app.storage.local.set({ config });
		await app.action.setBadgeText({ text: "" });
		await setupScheduleAlarm();
	}
	if (message.action === "schedule") {
		await setupScheduleAlarm();
		if (
			config.scheduleDefault !== "scheduleT1" &&
			config.scheduleDefault !== "scheduleT2"
		) {
			console.log("%cSchedule triggered by User", "color:orange");
			await initialise(
				config.scheduleDesk,
				config.scheduleMob,
				config.scheduleMin,
				config.scheduleMax,
			);
			await setupScheduleAlarm();
		}
	}
	if (message.action === "simulate") {
		if (!pro.key) return;
		const tab = await app.tabs.query({
			active: true,
			currentWindow: true,
			// lastFocusedWindow: true,
		});
		// console.log("Simulation Tab:", tab[0].id, simulatedTabs);
		const tabId = tab[0].id;
		// Check if the tab is already being simulated
		if (simulatedTabs.includes(tabId)) {
			// Remove the tab from the simulated tabs
			simulatedTabs = simulatedTabs.filter((id) => id !== tabId);
			// Detach the debugger from the tab
			await detach(tabId);
		} else {
			// Add the tab to the simulated tabs
			simulatedTabs.push(tabId);
			// Attach the debugger to the tab
			await debug(tabId);
		}
	}
	if (message.keepAlive) {
		sendResponse({ status: "alive" });
		console.log("Keep alive message received");
	}
	if (message.action === "activity") {
		activity = message.tabs;
	}
});
