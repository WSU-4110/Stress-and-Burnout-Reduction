const { FridayContent } = require('../DailyInteractive/dailyInteractive');

describe('FridayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

  it('updates #item2 with Friday content', () => {
    new FridayContent().setupContent();
    expect(document.querySelector('#item2').innerHTML).toContain('pick a enviroment and it comes with sound/changes background');
  });
});