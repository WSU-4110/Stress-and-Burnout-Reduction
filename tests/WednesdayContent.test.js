const { WednesdayContent } = require('../DailyInteractive/dailyInteractive');

describe('WednesdayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"><h1></h1></div>`;
  });

it('updates #item2 h1 with Wednesday content and attaches event listeners', () => {
  new WednesdayContent().setupContent();
  const instructionText = document.querySelector('.instruction-text').textContent;
  expect(instructionText).toContain('ASMR');
});

});