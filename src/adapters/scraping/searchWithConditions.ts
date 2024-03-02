import { By, until, WebDriver } from 'selenium-webdriver';
import { z } from 'zod';
import { err, ok, Result } from 'neverthrow';

import * as logger from '../../utils/logger';
import * as adapter from '../index';

export const searchWithCondition = async (
  browser: WebDriver,
  range: {
    from: string;
    to: string;
  },
  reservationId?: string
): Promise<
  Result<
    {
      hitsCount: number;
    },
    null
  >
> => {
  await browser.executeScript(
    "document.getElementById('rsvDateFrom').value = arguments[0]",
    range.from
  );
  await browser.executeScript(
    "document.getElementById('rsvDateTo').value = arguments[0]",
    range.to
  );
  if (reservationId) {
    await browser.executeScript(
      "document.getElementById('reserveId').value = arguments[0]",
      reservationId
    );
  }
  logger.info({
    message: 'set search conditions',
  });
  await browser.findElement(By.id('search')).click();

  // Loading
  while (true) {
    const loadings = await browser.findElements(By.id('shuhari_loader'));
    if (loadings.length === 0) {
      break;
    }
    logger.info({
      message: 'loading............',
    });
  }
  const resultByElm = By.xpath('/html/body/div[3]/div/div[2]/div/p');
  await browser.wait(until.elementLocated(resultByElm), 5000);

  const screenshot = await browser.takeScreenshot();
  await adapter.uploadScreenshot(screenshot, 'condition_executed');

  // Analyze results
  const resultCountText = await browser.findElement(resultByElm).getText();
  if (resultCountText === '該当する予約がありません') {
    logger.info({
      message: '該当する予約がありません',
      range,
      reservationId,
    });
    return err(null);
  }

  const resultCount = await browser
    .findElement(By.xpath('/html/body/div[3]/div/div[2]/div/p/b'))
    .getText();

  return ok({
    hitsCount: z
      .string()
      .refine((value) => !isNaN(Number(value)), {
        message: 'Not a valid number string',
      })
      .transform((v) => Number(v))
      .parse(resultCount),
  });
};
