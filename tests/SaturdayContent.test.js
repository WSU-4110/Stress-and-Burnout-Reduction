const { SaturdayContent } = require('../DailyInteractive/dailyInteractive');

describe('SaturdayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

  it('updates #item2 with Saturday content', () => {
    new SaturdayContent().setupContent();
    expect(document.querySelector('#item2').innerHTML).toContain('do nothing for 2 minutes');
  });
});