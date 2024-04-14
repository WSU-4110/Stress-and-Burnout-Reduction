import { onRequestGet, getSessionIdFromRequest } from "functions/api/username";
import { jest } from "@jest/globals";

const createMockRequest = (cookie = "") => ({
    headers: {
        get: jest.fn().mockReturnValue(cookie),
    },
});

describe("getSessionIdFromRequest", () => {
    it("should extract session ID if present", () => {
        const request = createMockRequest("session-id=abc123; other-cookie=something");
        const sessionId = getSessionIdFromRequest(request);
        expect(sessionId).toBe("abc123");
    });

    it("should return null if session ID is not present", () => {
        const request = createMockRequest("other-cookie=something");
        const sessionId = getSessionIdFromRequest(request);
        expect(sessionId).toBeNull();
    });
});

describe("onRequestGet", () => {
    it("should return username if session ID and user are found", async () => {
        const env = {
            COOLFROG_SESSIONS: {
                get: jest.fn().mockResolvedValue(
                    JSON.stringify({
                        username: "bob",
                    })
                ),
            },
        };
        const request = createMockRequest("session-id=valid-session-id");
        const result = await onRequestGet({
            request,
            env,
        });
        expect(result.status).toBe(200);
        expect(await result.json()).toEqual({
            username: "bob",
        });
    });

    it("should return error if session ID is missing", async () => {
        const request = createMockRequest("");
        const env = {
            COOLFROG_SESSIONS: {
                get: jest.fn().mockResolvedValue(null),
            },
        };
        const result = await onRequestGet({
            request,
            env,
        });
        expect(result.status).toBe(401);
        expect(await result.json()).toEqual({
            error: "Session ID missing from cookies",
        });
    });

    it("should return error if session ID is invalid", async () => {
        const request = createMockRequest("session-id=invalid-session-id");
        const env = {
            COOLFROG_SESSIONS: {
                get: jest.fn().mockResolvedValue(null),
            },
        };
        const result = await onRequestGet({
            request,
            env,
        });
        expect(result.status).toBe(401);
        expect(await result.json()).toEqual({
            error: "Session not found",
        });
    });
});
