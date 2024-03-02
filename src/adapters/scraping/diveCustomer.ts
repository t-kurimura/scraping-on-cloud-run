import { By, until, WebDriver } from 'selenium-webdriver';
import { err, ok, Result } from 'neverthrow';

import * as logger from '../../utils/logger';
import { extractTextByXpathIfExist } from '../../utils/scraiper';

type PastReservation = {
  reservationId: string;
  date: Date;
};

type Customer = {
  birthday: string | null;
  gender: string | null;
  pastReservation: PastReservation[];
};

export async function diveCustomer(
  browser: WebDriver,
  customerId: string,
  screenshot: {
    takeAndUpload: (browser: WebDriver, fileName: string) => Promise<void>;
  }
): Promise<Result<Customer, null>> {
  const baseUrl = `https://sample.com/KLP/customer/customerDetail/?customerId=${customerId}`;
  await browser.get(baseUrl);
  await browser.wait(until.elementLocated(By.id('customerDetail')), 5000);

  await screenshot.takeAndUpload(browser, 'customer');

  const baseInfo: Omit<Customer, 'pastReservation'> = {
    birthday: await extractTextByXpathIfExist(
      browser,
      '//th[text()="誕生日"]/following-sibling::td'
    ),
    gender: await extractTextByXpathIfExist(
      browser,
      '//th[text()="性別"]/following-sibling::td'
    ),
  };

  // ページ数取得
  const pageText = await browser
    .findElement(
      By.css(
        '#customerDetail > div.mod_column02.mt15.cf.reserveListPaging > div > div > p.page.mod_font01'
      )
    )
    .getText();
  logger.info({
    pageText,
  });
  if (!pageText) {
    return err(null);
  }
  const [numerator, totalPage] = pageText
    .split('/')
    .map((str) => parseInt(str.replace('ページ', ''), 10));

  const reservations: {
    reservationId: string;
    date: Date;
  }[] = [];
  let currentPage = numerator;
  while (currentPage <= totalPage) {
    const tables = await browser.findElements(
      By.xpath('//form//table[last()]')
    );
    const rows = await tables[tables.length - 1].findElements(
      By.xpath('.//tr')
    );
    if (rows.length <= 1) {
      break;
    }
    for (const row of rows.slice(1)) {
      const reservationId = (
        await (
          await row.findElement(By.css('td a.reserveActionLinkTypePost'))
        ).getText()
      )
        .replace('(', '')
        .replace(')', '');
      const reserveDate = (
        await (await row.findElement(By.css('td:first-child'))).getText()
      ).split('\n')[0];
      reservations.push({
        reservationId,
        date: new Date(reserveDate),
      });
    }

    currentPage++;
    await browser.get(`${baseUrl}&pn=${currentPage + 1}`);
    await new Promise((r) => setTimeout(r, 2000)); // sleep for 2 seconds
  }

  logger.info({
    message: `Total past reservations`,
    reservations,
  });

  return ok({
    ...baseInfo,
    pastReservation: reservations,
  });
}
