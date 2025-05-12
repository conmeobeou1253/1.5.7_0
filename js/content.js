const app = chrome || browser;

let selectedNiche = "random";
let queryInput = document.querySelector("#sb_form_q");
let textTyped = "";
let query = "";

app.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "query") {
		console.log("Received query message");
		niche = message.niche;
		mimicQuery(niche);
		setInterval(() => {
			app.runtime.sendMessage({ keepAlive: true });
		}, 5000);
	}
	if (message.action === "searchPerform") {
		console.log("Received searchPerform message");
		if (query.trim() !== "") {
			sendResponse({ message: "searching", query: query });
		}
		index = message.index;
		mimicSearch();
	}
	if (message.keepContent) {
		console.log("Received keepContent message");
		sendResponse({ message: "Content script is alive" });
	}
	if (message.action === "activity") {
		console.log(message);
		const linkToClick = message.url;
		const links = document.querySelectorAll("a");

		console.log(links);

		for (const a of links) {
			// Ignore links that contain the .mee-icon-SkypeCircleCheck:before
			if (
				a.href === linkToClick &&
				!a.querySelector(".mee-icon-SkypeCircleCheck")
			) {
				// Bring link into view
				a.scrollIntoView({ behavior: "smooth", block: "center" });

				// Simulate human-like hover and click
				a.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
				a.focus(); // Ensure it's focused
				a.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
				a.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
				a.dispatchEvent(new MouseEvent("click", { bubbles: true }));

				break; // Stop after clicking the first valid link
			}
		}
	}
});

async function mimicQuery(niche) {
	if (niche === "random") {
		let categories = [
			"random",
			"tech",
			"random",
			"anime",
			"random",
			"travel",
			"random",
			"movies",
			"random",
			"education",
			"random",
			"sports",
			"random",
			"music",
			"random",
		];
		selectedNiche =
			categories[Math.floor(Math.random() * categories.length)];
	} else {
		selectedNiche = niche;
	}
	const queries = searchQueries[selectedNiche];
	let randomQuery = queries[Math.floor(Math.random() * queries.length)];
	mimicTyping(randomQuery);
}

async function mimicTyping(text) {
	queryInput = document.querySelector("#sb_form_q");
	queryInput.focus();
	queryInput.value = "";
	// Function to add random typing errors
	function addRandomError(inputString, errorRate = 0.01, swapRate = 0.01) {
		let result = "";
		for (let i = 0; i < inputString.length; i++) {
			let char = inputString[i];
			// Apply error randomly
			if (Math.random() < errorRate) {
				// 50% chance to swap adjacent letters or add random character
				if (Math.random() < swapRate && i < inputString.length - 1) {
					result += inputString[i + 1];
					result += inputString[i];
					i++; // Skip the next character, as it was swapped
				} else {
					let randomChar = String.fromCharCode(
						97 + Math.floor(Math.random() * 26),
					); // Random lowercase letter
					result += randomChar;
				}
			} else {
				result += char; // No error, keep the character
			}
		}
		return result;
	}

	// Add random errors before typing to the queryInput
	let textWithErrors = Math.random() < 0.25 ? addRandomError(text) : text;
	query = textWithErrors;

	// Type the text with delay and errors
	for (const char of textWithErrors) {
		const delayMs = Math.floor(Math.random() * (300 - 50 + 1)) + 50; // Random delay between 50ms and 300ms
		textTyped += char;
		queryInput.value = textTyped; // Update value progressively
		await delay(delayMs); // Wait for the random delay
	}
	queryInput.value = query; // Set the final value after typing

	const menu = document.getElementById("mHamburger");
	if (menu) {
		await delay(1000);
		// menu.click();
		try {
			menu.click();

			console.log("Clicked menu");
		} catch (e) {
			console.log(e);
		}
	}
	const panel = document.querySelector("#id_rh_w");
	if (panel) {
		try {
			panel.click();
			console.log("Clicked panel");
		} catch (e) {
			console.log("Panel click failed:", e);
		}
	}
	await mimicDocumentScroll();
}

async function mimicDocumentScroll() {
	// Calculate a random scroll position between 30% to 70% of the viewport height
	const targetScrollPercentage = Math.random() * (0.7 - 0.3) + 0.3; // Random between 30% to 70%
	const targetScrollPosition =
		document.documentElement.scrollHeight * targetScrollPercentage;

	const currentScroll = window.scrollY;
	const scrollDistance = targetScrollPosition - currentScroll; // The distance to scroll
	const scrollDuration = Math.random() * (2000 - 500) + 500; // Random duration between 500ms to 2s for realistic time

	// Function to smoothly scroll
	const scrollStep = scrollDistance / 100; // Divide the scroll distance into 100 steps
	const stepDuration = scrollDuration / 100; // Divide the scroll duration into 100 steps for smoothness

	// Smooth scrolling with small steps and random delays
	for (let i = 0; i < 100; i++) {
		window.scrollTo(0, currentScroll + i * scrollStep); // Scroll by a small step
		const randomDelay =
			Math.random() * (stepDuration / 2) + stepDuration / 2; // Random delay to mimic human-like scroll speed
		await delay(randomDelay); // Wait for the next scroll step
	}
}

// Helper delay function for the random time intervals
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const mimicSearch = async () => {
	queryInput = document.querySelector("#sb_form_q");
	queryInput.focus();
	queryInput.value = query; // Set the final value after typing
	// check if any ul with role listbox is present with aria-label as Suggestions
	// let suggestions = document.querySelectorAll(
	// 	'ul[role="listbox"][aria-label="Suggestions"]',
	// )[1];
	// if (suggestions) {
	// 	let randomLis = suggestions.querySelectorAll("li");

	// 	if (randomLis.length > 0) {
	// 		// Select a random 'li' element
	// 		let randomLiIndex = Math.floor(Math.random() * randomLis.length);
	// 		let randomLi = randomLis[randomLiIndex];

	// 		// Get the 'url' attribute from the 'li' element
	// 		let url = randomLi.getAttribute("url");

	// 		// Check if the 'url' attribute exists and has a valid value
	// 		if (url && Math.random() < 0.5) {
	// 			// Redirect to the selected URL
	// 			if (index > 1) {
	// 				queryInput.focus();
	// 			}
	// 			window.location.href = url;
	// 		} else {
	// 			queryInput.closest("form").submit();
	// 		}
	// 	}
	// } else {
	// 	if (index > 1) {
	// 		queryInput.focus();
	// 	}
	queryInput.closest("form").submit();
	// }
};
