const base_url = "https://api.gumroad.com/v2/licenses";
const product_id = "D-1vxIJJlbq1sZUhTpz70A==";

// Function to log messages with color
function smartLog(message, color) {
	console.log(`%c${message}`, `color: ${color};`);
}

export const a = async (key) => {
	try {
		const response = await fetch(`${base_url}/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				product_id: product_id,
				license_key: key,
			}),
		});

		const data = await response.json();
		const { purchase, success, uses } = data;
		console.log(data);
		

		if (!success) {
			smartLog("Activation failed:" + data, "red");
			return {
				status: "failed",
				message: "License activation failed",
			};
		}

		if (
			purchase.subscription_cancelled_at ||
			purchase.subscription_ended_at ||
			purchase.subscription_failed_at ||
			purchase.disputed ||
			purchase.product_id !== product_id
		) {
			smartLog(
				"Invalid license conditions detected:" + purchase,
				"yellow",
			);
			return {
				status: "failed",
				message:
					"License is not active due to invalid conditions (subscription, dispute, refund, test purchase, or product mismatch)",
			};
		}
		smartLog("License activated successfully", "green");
		return {
			status: "success",
			message: "License activated successfully",
			uses: data.uses,
		};
	} catch (error) {
		smartLog("Error activating license:" + error, "red");
		return { status: "error", message: "Error activating license" };
	}
};

export const r = async (key, seatsUsed) => {
	try {
		const response = await fetch(`${base_url}/verify`, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				product_id: product_id,
				license_key: key,
				increment_uses_count: false,
			}),
		});

		const data = await response.json();
		const { purchase, success, uses } = data;
		console.log(data);

		if (!success) {
			smartLog("Re-verification failed:" + data, "red");
			return {
				status: "failed",
				message: "License re-verification failed",
			};
		}

		if (
			purchase.subscription_cancelled_at ||
			purchase.subscription_ended_at ||
			purchase.subscription_failed_at ||
			purchase.disputed ||
			purchase.product_id !== product_id
		) {
			smartLog(
				"Invalid license conditions during re-verification:" + purchase,
				"yellow",
			);
			return {
				status: "failed",
				message:
					"License is not active due to invalid conditions (subscription, dispute, refund, test purchase, or product mismatch)",
			};
		}
		if (uses > (seatsUsed + 2)) {
			smartLog("License used somewhere else", "red");
			return {
				status: "failed",
				message: "License limit exceeded",
			};
		}
		smartLog("License re-verified successfully", "green");
		return {
			status: "success",
			message: "License re-verified successfully",
			uses: data.uses,
		};
	} catch (error) {
		smartLog("Error re-verifying license:" + error, "red");
		return { status: "error", message: "Error re-verifying license" };
	}
};