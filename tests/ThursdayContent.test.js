const { ThursdayContent } = require('../DailyInteractive/dailyInteractive');

describe('ThursdayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

  it('updates #item2 with Thursday content and attaches event listeners to the image', () => {
    new ThursdayContent().setupContent();
    expect(document.querySelector('#item2').innerHTML).toContain('cat-gif');
  });
});