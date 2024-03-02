import { WebDriver } from 'selenium-webdriver';
import { err, Result } from 'neverthrow';

import * as adapter from '../../adapters';
import { updateScrapingStatus } from '../../adapters';

const retrieveAndApplyCookies = async (
  browser: WebDriver,
  sampleBoardId: string
): Promise<void> => {
  const cookies = await adapter.retrieveLoginCookies(sampleBoardId);
  if (cookies.isOk()) {
    const manager = await browser.manage();
    for (const cookie of cookies.value) {
      await manager.addCookie(cookie);
    }
  }
};

const extractAndSaveCookiesIfLoginSucceeded = async (
  browser: WebDriver,
  sampleBoardId: string,
  r: Result<adapter.LoginSuccess, adapter.LoginError>
): Promise<void> => {
  if (r.isOk()) {
    const cookies = await browser.manage().getCookies();
    await adapter.saveLoginCookies(sampleBoardId, cookies);
  }
};

const takeScreenshotOnBrowserAndUploadGCS = async (
  browser: WebDriver,
  fileName: string
): Promise<void> => {
  const screenshot = await browser.takeScreenshot();
  await adapter.uploadScreenshot(screenshot, fileName);
};

export const login = async (
  browser: WebDriver,
  salonId: string,
  forceLogin = false
): Promise<
  Result<adapter.LoginSuccess, adapter.LoginError | { type: 'firestore' }>
> => {
  const sampleBoards = await adapter.getSampleBoards(salonId);
  if (sampleBoards.isErr()) {
    await updateScrapingStatus(salonId, {
      scraping: {
        status: 'red',
        yellowDetectedTime: null,
        redDetectedTime: new Date(),
      },
    });
    return err({ type: 'firestore' });
  }
  await updateScrapingStatus(salonId, {
    scraping: {
      status: 'green',
      yellowDetectedTime: null,
      redDetectedTime: null,
    },
  });

  const loginResult = await adapter.login(
    browser,
    sampleBoards.value[0], // TODO FIX WHEN ACHIEVING n-SampleBoard to 1-salon
    {
      load: retrieveAndApplyCookies,
      save: extractAndSaveCookiesIfLoginSucceeded,
    },
    {
      takeAndUpload: takeScreenshotOnBrowserAndUploadGCS,
    },
    forceLogin
  );

  if (loginResult.isOk()) {
    if (loginResult.value.alertMessage) {
      await updateScrapingStatus(salonId, {
        scraping: {
          status: 'yellow',
          yellowDetectedTime: new Date(),
          redDetectedTime: null,
        },
      });
    } else {
      await updateScrapingStatus(salonId, {
        scraping: {
          status: 'green',
          yellowDetectedTime: null,
          redDetectedTime: null,
        },
      });
    }
  } else {
    await updateScrapingStatus(salonId, {
      scraping: {
        status: 'red',
        yellowDetectedTime: null,
        redDetectedTime: new Date(),
      },
    });
  }

  return loginResult;
};
