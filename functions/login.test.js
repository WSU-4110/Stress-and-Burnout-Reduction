import {
	onRequestPost,
	responseForRetry
} from "./login";
import {
	jest
} from "@jest/globals";
import {
	pbkdf2Sync
} from "node:crypto";

function createMockFormData(email, password) {
	return new Map([
		["email", email],
		["password", password],
	]);
}

describe("onRequestPost", () => {
	it("should create a session when credentials are valid and handle login streak", async () => {
		const email = "user@example.com";
		const rawPassword = "password123";
		const salt = "somesalt";
		const hashedPassword = pbkdf2Sync(rawPassword, salt, 1000, 64, "sha256").toString("hex");

		const request = {
			formData: () => Promise.resolve(createMockFormData(email, rawPassword)),
		};
		const usernameKey = "testuser";
		const user = {
			username: usernameKey,
			password: hashedPassword,
			salt: salt,
			sessions: [],
			login_streak_days: 1, // Assuming this is already there.
			time_last_sign_in: Date.now() / 1000 - 60000, // Logged in one minute ago.
		};

		const env = {
			COOLFROG_EMAILS: {
				get: jest.fn().mockResolvedValue(usernameKey),
			},
			COOLFROG_USERS: {
				get: jest.fn().mockResolvedValue(JSON.stringify(user)),
				put: jest.fn().mockResolvedValue(null),
			},
			COOLFROG_SESSIONS: {
				put: jest.fn().mockResolvedValue(null),
			},
			COOLFROG_LEADERBOARD: {
				put: jest.fn().mockResolvedValue(null),
			}
		};

		const {
			onRequestPost
		} = await import("./login.js");
		const result = await onRequestPost({
			request,
			env
		});

		expect(env.COOLFROG_EMAILS.get).toBeCalledWith(email);
		expect(env.COOLFROG_USERS.get).toBeCalledWith(usernameKey);
		expect(env.COOLFROG_USERS.put).toBeCalled();
		expect(env.COOLFROG_SESSIONS.put).toBeCalled();
		expect(env.COOLFROG_LEADERBOARD.put).toBeCalledWith(user.username, expect.any(String));
		expect(result.headers.get("Set-Cookie")).toMatch(/session-id=/);
		expect(result.status).toBe(200);
		expect(await result.text()).toContain("Redirecting...");
	});
});

describe("responseForRetry", () => {
	it("should return HTML response indicating retry opportunity", async () => {
		const result = responseForRetry("Test retry message");
		const textResponse = await result.text();

		expect(result.status).toBe(400);
		expect(result.headers.get("Content-Type")).toBe("text/html");
		expect(textResponse).toContain("Test retry message");
		expect(textResponse).toContain("Retry Now");
	});
});