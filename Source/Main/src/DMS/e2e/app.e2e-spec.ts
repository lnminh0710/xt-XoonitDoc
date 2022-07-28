import { XenaUIPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: XenaUIPage;

  beforeEach(() => {
    page = new XenaUIPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('app works!');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
