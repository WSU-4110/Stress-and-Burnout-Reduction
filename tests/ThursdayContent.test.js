const {
	ThursdayContent
} = require('../DailyInteractive/dailyInteractive');

describe('ThursdayContent', () => {
	beforeEach(() => {
		document.body.innerHTML = `<div id="item2"></div>`;
	});

	it('updates #item2 with Thursday content and attaches event listeners to the image', () => {
		new ThursdayContent().setupContent();
		const catImage = document.querySelector('.cat-gif').src;
		expect(catImage).toContain('3699234f311b8d44ba46d6503b4a033c.gif');
	});

});