const {
	FridayContent
} = require('../dailyInteractive');

describe('FridayContent', () => {
	beforeEach(() => {
		document.body.innerHTML = `<div id="item2"></div>`;
	});

	it('updates #item2 with Friday content', () => {
		new FridayContent().setupContent();
		const environmentCount = document.querySelectorAll('.environment-button').length;
		expect(environmentCount).toBe(3);
	});

});