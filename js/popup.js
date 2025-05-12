import { a, r} from "/js/gr.js";
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
	isRunning: false,
	userConsent: true,
	patch: false,
	niche: "random",
};
let pro = {
	key: "activated",
	seats: 0,
}

const $search = $("#search");
const $searchDiv = $("#searchDiv");
const $schedule = $("#schedule");
const $scheduleDiv = $("#scheduleDiv");
const $advanced = $("#advanced");
const $advancedDiv = $("#advancedDiv");

const $searchNiche = $(".searchNiche");

const $searchDesktop = $("#searchDesktop");
const $searchMobile = $("#searchMobile");
const $scheduleDesktop = $("#scheduleDesktop");
const $scheduleMobile = $("#scheduleMobile");

const $searchPerform = $("#searchPerform");
const $schedulePerform = $("#schedulePerform");

const $searchMin = $("#searchMin");
const $searchMax = $("#searchMax");
const $scheduleMin = $("#scheduleMin");
const $scheduleMax = $("#scheduleMax");

const $searchT1 = $("#searchT1");
const $searchT2 = $("#searchT2");
const $searchT3 = $("#searchT3");
const $searchT4 = $("#searchT4");

const $scheduleT1 = $("#scheduleT1");
const $scheduleT2 = $("#scheduleT2");
const $scheduleT3 = $("#scheduleT3");
const $scheduleT4 = $("#scheduleT4");

const $yesPatch = $("#yesPatch");
const $noPatch = $("#noPatch");

const $device = $("#device");

const $shuffle = $("#shuffle");

const $proKey = $("#proKey");

const proFeatures = ["searchNiche", "device", "scheduleInput", "scheduleDelay", "scheduleDefault"];

// Fetch storage
async function fetchStorage() {
	const storage = await app.storage.local.get("config");
	const syncStorage = await app.storage.sync.get("pro");
	if (storage.config) {
		config = { ...config, ...storage.config };
	}
	// if (!config.userConsent) {
	// 	window.location.href = "/consent.html";
	// }
	pro = { ...pro, ...syncStorage.pro };
	console.log(pro);
	await updateUI();
}

// Update UI
async function updateUI() {
	// Set the values
	console.log(config);
	$searchDesktop.val(config.searchDesk);
	$searchMobile.val(config.searchMob);
	$searchMin.val(config.searchMin);
	$searchMax.val(config.searchMax);

	$scheduleDesktop.val(config.scheduleDesk);
	$scheduleMobile.val(config.scheduleMob);
	$scheduleMin.val(config.scheduleMin);
	$scheduleMax.val(config.scheduleMax);

	$("#scheduleDefault").children().removeClass("selected");
	$(`#${config.scheduleDefault}`).addClass("selected");

	if (config.patch) {
		$yesPatch.addClass("selected");
		$noPatch.removeClass("selected");
	} else {
		$noPatch.addClass("selected");
		$yesPatch.removeClass("selected");
	}

	$searchNiche.removeClass("selected");
	$(`#search${config.niche}`).addClass("selected");

	if (config.isRunning == true) {
		$searchPerform.text("Stop");
		$schedulePerform.text("Stop");
	} else {
		$searchPerform.text("Search");
		$schedulePerform.text("Schedule");
	}

	if (config.deviceName !== undefined && config.deviceName !== "") {
		$shuffle.text(config.deviceName);
	} else {
		console.log("Shuffle");

		const randomDevice =
			devices[Math.floor(Math.random() * devices.length)];
		config.deviceName = randomDevice.name;
		config.deviceUserAgent = randomDevice.userAgent;
		config.deviceWidth = randomDevice.width;
		config.deviceHeight = randomDevice.height;
		config.deviceScaleFactor = randomDevice.deviceScaleFactor;
		await app.storage.local.set({ config });
		$shuffle.text(config.deviceName);
	}

	if (pro.key !== "") {
		$proKey.val(pro.key);
		proFeatures.forEach((feature) => {
			$(`#${feature}`).removeClass("pro");
		});
	} else {
		proFeatures.forEach((feature) => {
			$(`#${feature}`).addClass("pro");
		});
	}

	compare();
}

// Compare
async function compare() {
	$("#searchDefault").children().removeClass("selected");
	if (config.searchDesk == 0 && config.searchMob == 0) {
		$searchPerform.text("Automate Activities (Beta)");
		if (pro.key) {
			$searchPerform.text("Automate Activities (Beta)");
		} else {
			$searchPerform.text("Upgrade to Automate Activities");
		}
	} else {
		if (config.isRunning == true) {
			$searchPerform.text("Stop");
			$schedulePerform.text("Stop");
		} else {
			$searchPerform.text("Search");
			$schedulePerform.text("Schedule");
		}
	}
	if (config.searchDesk == 10 && config.searchMob == 0) {
		$searchT1.addClass("selected");
	}
	if (config.searchDesk == 20 && config.searchMob == 10) {
		$searchT2.addClass("selected");
	}
	if (config.searchDesk == 30 && config.searchMob == 20) {
		$searchT3.addClass("selected");
	}
	if (config.searchDesk == 50 && config.searchMob == 30) {
		$searchT4.addClass("selected");
	}
}

// Store
async function store() {
	config.searchDesk = parseInt($searchDesktop.val()) || 0;
	config.searchMob = parseInt($searchMobile.val()) || 0;
	config.searchMin = parseInt($searchMin.val()) || 15;
	config.searchMax = parseInt($searchMax.val()) || 45;

	config.scheduleDesk = parseInt($scheduleDesktop.val()) || 0;
	config.scheduleMob = parseInt($scheduleMobile.val()) || 0;
	config.scheduleMin = parseInt($scheduleMin.val()) || 15;
	config.scheduleMax = parseInt($scheduleMax.val()) || 45;

	await app.storage.local.set({ config });

	compare();
}

$(document).ready(async function () {
	$("body").css("--scale", screen.width / 1920);
	await fetchStorage();

	$search.click(function () {
		$search.addClass("selected");
		$schedule.removeClass("selected");
		$searchDiv.show();
		$scheduleDiv.hide();
	});
	$search.click();

	$schedule.click(function () {
		$search.removeClass("selected");
		$schedule.addClass("selected");
		$searchDiv.hide();
		$scheduleDiv.show();
	});

	$shuffle.click(async () => {
		const randomDevice =
			devices[Math.floor(Math.random() * devices.length)];
		config.deviceName = randomDevice.name;
		config.deviceUserAgent = randomDevice.userAgent;
		config.deviceWidth = randomDevice.width;
		config.deviceHeight = randomDevice.height;
		config.deviceScaleFactor = randomDevice.deviceScaleFactor;
		await app.storage.local.set({ config });
		$shuffle.text(config.deviceName);
	});

	$searchNiche.click(function () {
		if (!pro.key) return;
		const niche = $(this).attr("id").split("search")[1];
		config.niche = niche;
		$searchNiche.removeClass("selected");
		$(this).addClass("selected");
		app.storage.local.set({ config });
	});

	// Numeric input
	$searchDesktop.on("input change", function () {
		if (isNaN($searchDesktop.val()) || $searchDesktop.val() == "") {
			$searchDesktop.val(0);
		}
		store();
	});
	$searchMobile.on("input change", function () {
		if (isNaN($searchMobile.val()) || $searchMobile.val() == "") {
			$searchMobile.val(0);
		}
		store();
	});
	$searchMin.on("input change", function () {
		if (
			isNaN($searchMin.val()) ||
			$searchMin.val() == "" ||
			$searchMin.val() < 15
		) {
			$searchMin.val(15);
		}
		if ($searchMin.val() >= $searchMax.val() / 1.5) {
			$searchMax.val(parseInt($searchMin.val() * 1.5));
		}
		store();
	});
	$searchMax.on("input change", function () {
		if (
			isNaN($searchMax.val()) ||
			$searchMax.val() == "" ||
			$searchMax.val() < 30
		) {
			$searchMax.val(30);
		}
		if ($searchMax.val() < $searchMin.val() * 1.5) {
			$searchMin.val(parseInt($searchMax.val() / 2));
		}
		store();
	});

	$scheduleDesktop.on("input change", function () {
		if (!pro.key) return;
		if (isNaN($scheduleDesktop.val()) || $scheduleDesktop.val() == "") {
			$scheduleDesktop.val(0);
		}
		store();
	});
	$scheduleMobile.on("input change", function () {
		if (!pro.key) return;
		if (isNaN($scheduleMobile.val()) || $scheduleMobile.val() == "") {
			$scheduleMobile.val(0);
		}
		store();
	});
	$scheduleMin.on("input change", function () {
		if (!pro.key) return;
		if (
			isNaN($scheduleMin.val()) ||
			$scheduleMin.val() == "" ||
			$scheduleMin.val() < 15
		) {
			$scheduleMin.val(15);
		}
		if ($scheduleMin.val() >= $scheduleMax.val() / 1.5) {
			$scheduleMax.val(parseInt($scheduleMin.val() * 1.5));
		}
		store();
	});
	$scheduleMax.on("input change", function () {
		if (!pro.key) return;
		if (
			isNaN($scheduleMax.val()) ||
			$scheduleMax.val() == "" ||
			$scheduleMax.val() < 30
		) {
			$scheduleMax.val(30);
		}
		if ($scheduleMax.val() < $scheduleMin.val() * 1.5) {
			$scheduleMin.val(parseInt($scheduleMax.val() / 1.5));
		}
		store();
	});

	$searchT1.click(function () {
		$("#searchDefault").children().removeClass("selected");
		$searchT1.addClass("selected");
		$searchDesktop.val(10);
		$searchMobile.val(0);
		store();
	});
	$searchT2.click(function () {
		$("#searchDefault").children().removeClass("selected");
		$searchT2.addClass("selected");
		$searchDesktop.val(20);
		$searchMobile.val(10);
		store();
	});
	$searchT3.click(function () {
		$("#searchDefault").children().removeClass("selected");
		$searchT3.addClass("selected");
		$searchDesktop.val(30);
		$searchMobile.val(20);
		store();
	});
	$searchT4.click(function () {
		$("#searchDefault").children().removeClass("selected");
		$searchT4.addClass("selected");
		$searchDesktop.val(50);
		$searchMobile.val(30);
		store();
	});

	$scheduleT1.click(function () {
		if (!pro.key) return;
		$("#scheduleDefault").children().removeClass("selected");
		$scheduleT1.addClass("selected");
		$scheduleDesktop.val(0);
		$scheduleMobile.val(0);
		config.scheduleDefault = "scheduleT1";
		store();
	});
	$scheduleT2.click(function () {
		if (!pro.key) return;
		$("#scheduleDefault").children().removeClass("selected");
		$scheduleT2.addClass("selected");
		$scheduleDesktop.val(config.searchDesk);
		$scheduleMobile.val(config.searchMob);
		config.scheduleDefault = "scheduleT2";
		store();
	});
	$scheduleT3.click(function () {
		if (!pro.key) return;
		$("#scheduleDefault").children().removeClass("selected");
		$scheduleT3.addClass("selected");
		$scheduleDesktop.val(1);
		$scheduleMobile.val(1);
		config.scheduleDefault = "scheduleT3";
		store();
	});
	$scheduleT4.click(function () {
		if (!pro.key) return;
		$("#scheduleDefault").children().removeClass("selected");
		$scheduleT4.addClass("selected");
		$scheduleDesktop.val(3);
		$scheduleMobile.val(3);
		config.scheduleDefault = "scheduleT4";
		store();
	});

	$searchPerform.click(function () {
		if (config.isRunning) {
			$searchPerform.text("Search");
			$schedulePerform.text("Schedule");
			app.runtime.sendMessage({ action: "stop" });
		} else {
			$searchPerform.text("Stop");
			$schedulePerform.text("Stop");
			app.runtime.sendMessage({ action: "search" });
		}
	});
	$schedulePerform.click(function () {
		if (!pro.key) return;
		if (config.isRunning) {
			$searchPerform.text("Search");
			$schedulePerform.text("Schedule");
			app.runtime.sendMessage({ action: "stop" });
		} else {
			$searchPerform.text("Stop");
			$schedulePerform.text("Stop");
			app.runtime.sendMessage({ action: "schedule" });
		}
	});

	$device.click(async function () {
		if (!pro.key) return;
		await app.runtime.sendMessage({ action: "simulate" });
	});

	$yesPatch.click(function () {
		$yesPatch.addClass("selected");
		$noPatch.removeClass("selected");
		config.patch = true;
		app.storage.local.set({ config });
	});
	$noPatch.click(function () {
		$yesPatch.removeClass("selected");
		$noPatch.addClass("selected");
		config.patch = false;
		app.storage.local.set({ config });
	});

	// Pro
	$proKey.on("keydown", async function (e) {
		if (e.key === "Enter") {
			const key = $proKey.val();
			if (key.length != 0) {
				const isPro = await a(key);
				if (isPro.status === "success") {
					pro.key = key;
					pro.seats = isPro.uses;
					await app.storage.sync.set({ pro });
					$proKey.val(pro.key);
					proFeatures.forEach((feature) => {
						$(`#${feature}`).removeClass("pro");
					});
					updateUI();
				} else {
					pro.key = "";
					pro.seats = 0;
					await app.storage.sync.set({ pro });
					$proKey.val(pro.key);
					config.scheduleDefault = "scheduleT1";
					config.niche = "random";
					await app.storage.local.set({ config });
					proFeatures.forEach((feature) => {
						$(`#${feature}`).addClass("pro");
					});
					updateUI();
				}
			} else {
				pro.key = "";
				pro.seats = 0;
				await app.storage.sync.set({ pro });
				$proKey.val(pro.key);
				config.scheduleDefault = "scheduleT1";
				config.niche = "random";
				await app.storage.local.set({ config });
				proFeatures.forEach((feature) => {
					$(`#${feature}`).addClass("pro");
				});
				updateUI();
			}
		}
	});
});

app.runtime.onMessage.addListener(async function (message) {
	if (message.action === "updateUI") {
		window.location.reload();
	}
});