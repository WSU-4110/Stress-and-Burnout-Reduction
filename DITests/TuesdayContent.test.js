const { TuesdayContent } = require('../DailyInteractive/dailyInteractive');

describe('TuesdayContent', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="item2"></div>`;
  });

  it('updates #item2 with Tuesday content', () => {
    new TuesdayContent().setupContent();
    expect(document.querySelector('#item2').innerHTML).toContain('text box to type in ur worries and it ques an animation that gets rid of them');
  });
});