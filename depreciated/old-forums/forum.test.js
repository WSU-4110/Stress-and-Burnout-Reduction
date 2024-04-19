import {
	returnDate,
	returnTime,
	parseDate
} from './forum.js';

import {
	jest
} from "@jest/globals";

describe('Date and Time Functions Tests', () => {
	beforeAll(() => {
		jest.useFakeTimers('modern');
		jest.setSystemTime(new Date(2023, 3, 15, 12, 30, 0));
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	test('returnDate should format current date correctly', async () => {
		const date = await returnDate();
		expect(date).toBe("April 15, 2023");
	});

	test('returnTime should format current time correctly', async () => {
		const time = await returnTime();
		expect(time).toBe("12:30:00 PM");
	});

	describe('parseDate functionality', () => {
		test('should return 0 if the meeting date is in the past', async () => {
			const expectedPastDate = '04-14-2023';
			const result = await parseDate(expectedPastDate);
			expect(result).toBe(0);
		});

		test('should return 1 if the meeting date is in the future', async () => {
			const expectedFutureDate = '04-16-2023';
			const result = await parseDate(expectedFutureDate);
			expect(result).toBe(1);
		});

		test('should return 2 if the meeting date is today', async () => {
			const todayDate = '04-15-2023'; // Same as fake system time
			const result = await parseDate(todayDate);
			expect(result).toBe(2);
		});
	});
});