const { MondayContent } = require('../DailyInteractive/dailyInteractive');

describe('MondayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

  it('updates #item2 with Monday content', () => {
    new MondayContent().setupContent();
    expect(document.querySelector('#item2').innerHTML).toContain('Words of affirmation generator');
  });
});