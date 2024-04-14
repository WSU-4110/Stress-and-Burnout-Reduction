const {
	TuesdayContent
} = require('../scripts/dailyInteractive');

describe('TuesdayContent', () => {
	beforeEach(() => {
		document.body.innerHTML = `<div id="item2"></div>`;
	});

	it('updates #item2 with Tuesday content', () => {
		new TuesdayContent().setupContent();
		const instructionText = document.querySelector('.instruction-text').textContent;
		expect(instructionText).toContain('Enter your worries');
	});

});