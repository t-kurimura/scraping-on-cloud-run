import { By, WebDriver } from 'selenium-webdriver';
import dayjs from 'dayjs';
import { Result } from 'neverthrow';

import * as logger from '../../utils/logger';

type AbstractReservation = {
  status: string;
  staff: string;
  time: {
    start: Date;
  };
  name: string;
};

export async function listReservations(
  browser: WebDriver,
  range: {
    from: string;
    to: string;
  },
  screenshot: {
    takeAndUpload: (browser: WebDriver, fileName: string) => Promise<void>;
  },
  search: {
    searchWithCondition: (
      browser: WebDriver,
      range: {
        from: string;
        to: string;
      }
    ) => Promise<
      Result<
        {
          hitsCount: number;
        },
        null
      >
    >;
  }
): Promise<{ [key: string]: AbstractReservation }> {
  await browser.get('https://sample.com/KLP/reserve/reserveList/');

  // 検索
  const searchResult = await search.searchWithCondition(browser, range);
  if (searchResult.isErr()) {
    logger.error({
      message: 'search failed',
      error: searchResult.error,
    });
    return {};
  }

  await screenshot.takeAndUpload(browser, 'before_page');

  // ページ数取得
  const pageText = await browser
    .findElement(
      By.css(
        '#sortList > div.mod_column02.mt15.cf > div.columnBlock02 > div > p.page.mod_font01'
      )
    )
    .getText();
  logger.info({
    pageText,
  });
  if (!pageText) {
    return {};
  }
  const [numerator, totalPage] = pageText
    .split('/')
    .map((str) => parseInt(str.replace('ページ', ''), 10));

  // 当該ページを1行ずつ取得していく
  let currentPage = numerator;
  const results: { [key: string]: AbstractReservation } = {};
  while (currentPage <= totalPage) {
    logger.info({
      page: `${currentPage}/${totalPage}`,
    });

    const table = await browser.findElement(By.id('resultList'));
    const rows = await table.findElements(By.xpath('.//tr'));
    for (const row of rows) {
      const cols = await row.findElements(By.xpath('.//td'));
      if (cols.length === 0) {
        continue;
      }

      const reserveNum = (
        await (await cols[2].findElement(By.xpath('.//a'))).getText()
      ).replace(/[^a-zA-Z0-9]/g, '');
      const customerName = await (
        await cols[2].findElement(By.xpath('.//p[1]'))
      ).getText();
      const status = await cols[1].getText();
      const staff = await cols[3].getText();
      const visitTimeStr = await (
        await cols[0].findElement(By.xpath('.//a'))
      ).getText();
      const visitTime = dayjs(`${dayjs().year()}/${visitTimeStr}`).subtract(
        9,
        'hour'
      );

      logger.info({
        reserveNum,
        status,
        visitTime,
        staff,
      });

      results[reserveNum] = {
        status: status,
        staff: staff,
        time: {
          start: visitTime.toDate(),
        },
        name: customerName,
      };
    }

    // 次ページへ
    currentPage += 1;
    await browser.get(
      `https://sample.com/KLP/reserve/reserveList/changePage?pn=${
        currentPage + 1
      }`
    );
    await new Promise((res) => setTimeout(res, 3000));

    logger.info({
      total: rows.length,
    });
  }

  return results;
}
