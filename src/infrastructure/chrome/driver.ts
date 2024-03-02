import { Builder, logging, ThenableWebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

export const chromeDriver = (): ThenableWebDriver => {
  const options = new chrome.Options();
  options.headless();
  options.addArguments('window-size=1400x1200');
  options.addArguments('--no-sandbox');
  options.addArguments('--enable-file-cookies');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.excludeSwitches('--enable-logging');
  options.addArguments(
    '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
  );

  return new Builder()
    .forBrowser('chrome')
    .setLoggingPrefs(
      (() => {
        const logger = new logging.Preferences();
        logger.setLevel(logging.Type.DRIVER, logging.Level.ALL);
        logger.setLevel(logging.Type.BROWSER, logging.Level.ALL);
        return logger;
      })()
    )
    .setChromeOptions(options)
    .build();
};
