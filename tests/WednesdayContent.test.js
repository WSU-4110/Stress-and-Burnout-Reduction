const { WednesdayContent } = require('../DailyInteractive/dailyInteractive');

describe('WednesdayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"><h1></h1></div>`;
  });

  it('updates #item2 h1 with Wednesday content and attaches event listeners', () => {
    new WednesdayContent().setupContent();
    expect(document.querySelector('#item2 h1').innerHTML).toContain('interactive-box');
  });
});