import { describe, it, expect, jest } from "@jest/globals";

describe("onRequestPost", () => {
    it("should create a new user and return successful response when given unique username and email", async () => {
        const formData = new Map([
            ["username", "newuser"],
            ["email", "test@example.com"],
            ["password", "password123"],
            ["pronouns", "they/them"],
            ["given_names", "Test"],
            ["last_name", "User"],
        ]);

        const request = {
            formData: () => Promise.resolve(formData),
        };

        const env = {
            COOLFROG_USERS: {
                get: jest.fn().mockResolvedValue(null),
                put: jest.fn().mockResolvedValue(true),
            },
            COOLFROG_EMAILS: {
                get: jest.fn().mockResolvedValue(null),
                put: jest.fn().mockResolvedValue(true),
            },
        };

        const { onRequestPost } = await import("functions/signup");

        const result = await onRequestPost({ request, env });

        expect(result.status).toBe(200);
        expect(env.COOLFROG_USERS.get).toBeCalledWith("newuser");
        expect(env.COOLFROG_USERS.put).toBeCalled();
        expect(env.COOLFROG_EMAILS.get).toBeCalledWith("test@example.com");
        expect(env.COOLFROG_EMAILS.put).toBeCalled();
        expect(result.headers.get("Content-Type")).toBe("text/html");
        expect(await result.text()).toContain("Account Created Successfully");
    });
});
