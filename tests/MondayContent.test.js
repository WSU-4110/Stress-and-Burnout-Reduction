const { MondayContent } = require('../DailyInteractive/dailyInteractive');

describe('MondayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

it('updates #item2 with Monday content', () => {
  new MondayContent().setupContent();
  const affirmationText = document.querySelector('#affirmation-text').textContent;
  expect(affirmationText).toContain('You are capable and brave!');
});

});