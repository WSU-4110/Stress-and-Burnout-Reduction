import { onRequest, redirectToLogin } from "../../functions/signout";
import { jest } from "@jest/globals";

function createMockRequest(cookies = "") {
    return {
        headers: {
            get: jest.fn().mockReturnValue(`session-id=${cookies}`),
        },
    };
}

describe("onRequest", () => {
    it("should handle sign out process if session cookie is present", async () => {
        const request = createMockRequest("valid-session-id");
        const env = {
            COOLFROG_SESSIONS: {
                get: jest.fn().mockResolvedValue(JSON.stringify({ username: "testuser" })),
                delete: jest.fn().mockResolvedValue({}),
            },
            COOLFROG_USERS: {
                get: jest.fn().mockResolvedValue(
                    JSON.stringify({
                        username: "testuser",
                        sessions: [{ sessionId: "valid-session-id" }],
                    })
                ),
                put: jest.fn().mockResolvedValue({}),
            },
        };

        const result = await onRequest({ request, env });

        expect(env.COOLFROG_SESSIONS.delete).toBeCalledWith("valid-session-id");
        expect(env.COOLFROG_USERS.get).toBeCalled();
        expect(env.COOLFROG_USERS.put).toBeCalled();
        expect(result.headers.get("Set-Cookie")).toMatch(/Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
        expect(result.headers.get("Location")).toBe("/login");
    });
});

describe("redirectToLogin", () => {
    it("should return an HTML response with a redirect message", () => {
        const response = redirectToLogin("Test Message");
        expect(response.status).toBe(200);
        expect(response.headers.get("Content-Type")).toMatch("text/html");
        expect(response.text()).resolves.toContain("Test Message Redirecting to login...");
    });
});
