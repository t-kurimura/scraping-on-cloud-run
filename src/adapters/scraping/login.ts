import { By, error, Key, until, WebDriver } from 'selenium-webdriver';
import { err, ok, Result } from 'neverthrow';
import { UnexpectedAlertOpenError } from 'selenium-webdriver/lib/error';

import * as logger from '../../utils/logger';

export type LoginSuccess = { alertMessage: string | null };
export type LoginError = {
  type: 'recapture' | 'failure' | 'timeout' | 'unknown';
};

const waitForLoginResult = async (browser: WebDriver, timeoutMs: number) => {
  const captchaPage = browser.wait(
    // https://sample.com/CNC/login/doLogin/
    until.elementLocated(By.id('captchaForm')),
    timeoutMs
  );
  const failurePage = browser.wait(
    // https://sample.com/CNC/login/doLogin/
    until.elementLocated(
      By.css('#common_body > div.contents > div > div.div_err_message')
    ),
    timeoutMs
  );
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const onRejected = async (
    e: any
  ): Promise<Result<LoginSuccess, LoginError>> => {
    if (e instanceof error.TimeoutError) {
      return err({ type: 'timeout' });
    }
    if (e instanceof UnexpectedAlertOpenError) {
      await new Promise((r) => setTimeout(r, 5000)); // 成功でハンドリングされるはずなので待つ
    }
    logger.warning({
      message:
        'failed to wait for a exceptional flow, but the normal login process might have already proceeded.',
      error: e,
    });
    return err({ type: 'unknown' });
  };
  return Promise.race<Result<LoginSuccess, LoginError>>([
    (async (): Promise<Result<LoginSuccess, LoginError>> => {
      {
        try {
          // login success
          // https://sample.com/KLP/top/
          await browser.wait(
            until.elementLocated(
              By.css(
                'body > div.contents03 > div > div > div.columnBlock.w636 > p.mod_txt_37.mt20'
              )
            ),
            timeoutMs
          );
        } catch (e: unknown) {
          return err({ type: 'timeout' });
        }
        // アラートが表示される場合がある
        try {
          await browser.wait(until.alertIsPresent(), 3000);
        } catch (e) {
          return ok({ alertMessage: null });
        }
        const alert = await browser.switchTo().alert();
        const alertMessage = await alert.getText();
        return ok({ alertMessage });
      }
    })(),
    captchaPage.then(() => err({ type: 'recapture' }), onRejected),
    failurePage.then(() => err({ type: 'failure' }), onRejected),
  ]);
};

export const login = async (
  browser: WebDriver,
  cred: {
    id: string;
    password: string;
  },
  cookie: {
    load: (browser: WebDriver, fileName: string) => Promise<void>;
    save: (
      browser: WebDriver,
      fileName: string,
      r: Result<LoginSuccess, LoginError>
    ) => Promise<void>;
  },
  screenshot: {
    takeAndUpload: (browser: WebDriver, fileName: string) => Promise<void>;
  },
  forceLogin: boolean
): Promise<Result<LoginSuccess, LoginError>> => {
  if (!forceLogin) {
    await browser.get('https://sample.com/KLP/top/'); // どこかにアクセスしたあとでなければCookie付与できない
    await cookie.load(browser, cred.id);

    await browser.get('https://sample.com/KLP/top/');
    const resultWithExistingSession = await waitForLoginResult(browser, 5000);
    if (resultWithExistingSession.isOk()) {
      return ok(resultWithExistingSession.value);
    }
  }

  await browser.get('https://sample.com/login/');
  await browser.wait(until.elementLocated(By.id('idPasswordInputForm')), 3000);

  const userIdInput = await browser.findElement(By.name('userId'));
  await userIdInput.sendKeys(cred.id);

  const passwordInput = await browser.findElement(By.name('password'));
  await passwordInput.sendKeys(cred.password);

  await screenshot.takeAndUpload(browser, 'input_login_keys');

  await passwordInput.sendKeys(Key.RETURN);
  const result = await waitForLoginResult(browser, 5000);

  logger.info({
    message: 'login result',
    result,
    title: browser.getTitle(),
  });

  await cookie.save(browser, cred.id, result);
  await screenshot.takeAndUpload(browser, 'after_login');

  return result;
};
