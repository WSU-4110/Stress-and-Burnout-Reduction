const { SaturdayContent } = require('../DailyInteractive/dailyInteractive');

describe('SaturdayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

it('updates #item2 with Saturday content', () => {
  new SaturdayContent().setupContent();
  const promptText = document.querySelector('#item2 p').textContent;
  expect(promptText).toContain('Do nothing for 2 minutes');
});

});