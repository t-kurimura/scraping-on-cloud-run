import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { err, ok, Result } from 'neverthrow';
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import * as logger from '../../utils/logger';
import { extractTextByXpathIfExist } from '../../utils/scraiper';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

interface Time {
  start: Date | null;
  end: Date | null;
}

interface Coupon {
  name: string | null;
  description: string | null;
  conditions: {
    note: string | null;
    expiration: string | null;
    usage: string | null;
  };
}

interface Favor {
  gender: string | null;
  request: string | null;
  first_time: string | null;
  note: string | null;
  question: string | null;
  response: string | null;
}

interface Note {
  atReservation: string | null;
  forNext: string | null;
}

interface ReservationDetails {
  id: string;
  status: string | null;
  time: Time;
  source: string | null;
  options: string | null;
  staff: string | null;
  facilities: string | null;
  customerNumber: string | null;
  customerId: string;
  coupon: Coupon;
  favor: Favor;
  note: Note;
  hbContacts: string | null;
}

interface Customer {
  id: string;
  nameKana: string | null;
  nameKanji: string | null;
  phoneNumber: string | null;
  repeatCount: string | null;
  note: string | null;
  previousInfo: string | null;
}

interface SalesItem {
  category: string;
  menu: string;
  staff: string;
  price: string;
  units: string;
  amount: string;
}

interface Sale {
  id: string;
  time: string | null;
  pic: string | null;
  items: SalesItem[];
}

interface ReservationPageContent {
  reservation: ReservationDetails;
  customer: Customer;
  sale: Sale | null;
}

export async function diveReservation(
  browser: WebDriver,
  reservationId: string,
  range: {
    from: string;
    to: string;
  },
  search: {
    searchWithCondition: (
      browser: WebDriver,
      range: {
        from: string;
        to: string;
      },
      reservationId: string
    ) => Promise<
      Result<
        {
          hitsCount: number;
        },
        null
      >
    >;
  }
): Promise<Result<ReservationPageContent, null>> {
  await browser.get('https://sample.com/KLP/reserve/reserveList/');

  // 検索
  const searchResult = await search.searchWithCondition(
    browser,
    range,
    reservationId
  );
  if (searchResult.isErr()) {
    logger.error({
      message: 'search failed',
      error: searchResult.error,
    });
    return err(null);
  }

  // リンクを取得
  const reserveLinks = await browser.findElements(
    By.css('#reserveListArea a[href*=reserveId]')
  );
  const linkUrl = await reserveLinks[0].getAttribute('href');
  logger.info({
    reserveLink: linkUrl,
  });

  // 遷移
  await browser.get(linkUrl);
  await Promise.race([
    browser.wait(until.elementLocated(By.id('extReserveDetail')), 5000),
    browser.wait(until.elementLocated(By.id('netReserveDetail')), 5000),
  ]);

  // 来店日時の取得とdatetime型への変換
  const rsvDateElement = await browser.findElement(By.css('#rsvDate'));
  const rsvDateText = await rsvDateElement.getText();
  const dateStr = rsvDateText.split('（')[0];
  const timePattern = /\d{1,2}:\d{2}/g;
  const times = rsvDateText.match(timePattern) || [];

  const [startTime, endTime] = times.map((t) =>
    dayjs.utc(`${dateStr}${t}`, 'YYYY年M月D日H:mm').subtract(9, 'hour')
  );

  // 会計情報
  const salesExists = (await browser.findElements(By.id('salesId'))).length > 0;

  const customerIdElem = await browser.findElement(By.id('customerDetailLink'));
  const customerId = await customerIdElem.getAttribute('data-customerid');

  const extractedReservationId = await extractTextByXpathIfExist(
    browser,
    '//th[text()="予約番号"]/following-sibling::td'
  );
  if (!extractedReservationId) {
    console.error({
      message: 'could not get reservationId',
    });
    return err(null);
  }

  return ok({
    reservation: {
      id: extractedReservationId,
      status: await extractTextByXpathIfExist(
        browser,
        '//th[text()="ステータス"]/following-sibling::td'
      ),
      time: {
        start: startTime ? startTime.toDate() : null,
        end: endTime ? endTime.toDate() : null,
      },
      source: await extractTextByXpathIfExist(
        browser,
        '//th[text()="予約経路"]/following-sibling::td'
      ),
      options: await extractTextByXpathIfExist(
        browser,
        '//th[text()="割引・サービス・オプション"]/following-sibling::td'
      ),
      staff: await extractTextByXpathIfExist(
        browser,
        '//th[text()="スタッフ"]/following-sibling::td'
      ),
      facilities: await extractTextByXpathIfExist(
        browser,
        '//th[text()="設備"]/following-sibling::td'
      ),
      customerNumber: await extractTextByXpathIfExist(
        browser,
        '//th[text()="お客様番号"]/following-sibling::td'
      ),
      customerId: customerId,
      coupon: {
        name: await extractTextByXpathIfExist(
          browser,
          '//th[text()="クーポン名"]/following-sibling::td'
        ),
        description: await extractTextByXpathIfExist(
          browser,
          '//th[text()="クーポン内容"]/following-sibling::td'
        ),
        conditions: {
          note: await extractTextByXpathIfExist(
            browser,
            '//th[text()="提示条件"]/following-sibling::td[1]'
          ),
          expiration: await extractTextByXpathIfExist(
            browser,
            '//th[text()="有効期限"]/following-sibling::td[1]'
          ),
          usage: await extractTextByXpathIfExist(
            browser,
            '//th[text()="利用条件"]/following-sibling::td[1]'
          ),
        },
      },
      favor: {
        gender: await extractTextByXpathIfExist(
          browser,
          '//th[text()="性別"]/following-sibling::td'
        ),
        request: await extractTextByXpathIfExist(
          browser,
          '//th[text()="ご要望・ご相談"]/following-sibling::td'
        ),
        first_time: await extractTextByXpathIfExist(
          browser,
          '//th[text()="このサロンに行くのは初めてですか？"]/following-sibling::td'
        ),
        note: await extractTextByXpathIfExist(
          browser,
          '//th[text()="ご来店に際しての注意事項"]/following-sibling::td'
        ),
        question: await extractTextByXpathIfExist(
          browser,
          '//th[text()="サロンからお客様への質問"]/following-sibling::td/div'
        ),
        response: await extractTextByXpathIfExist(
          browser,
          '//th[text()="お客様のご回答"]/following-sibling::td/div'
        ),
      },
      note: {
        atReservation: await extractTextByXpathIfExist(
          browser,
          '//th[text()="来店回数"]/following-sibling::td'
        ),
        forNext: await extractTextByXpathIfExist(
          browser,
          '//th[text()="来店回数"]/following-sibling::td'
        ),
      },
      hbContacts: await extractTextByXpathIfExist(
        browser,
        '//th[text()="HOT PEPPER Beauty\n予約者連絡先"]/following-sibling::td'
      ),
    },
    customer: {
      id: customerId,

      nameKana: await extractTextByXpathIfExist(
        browser,
        '//th[text()="氏名 (カナ)"]/following-sibling::td/div[@class="nameKana"]'
      ),
      nameKanji: await extractTextByXpathIfExist(
        browser,
        '//th[text()="氏名 (漢字)"]/following-sibling::td'
      ),
      phoneNumber: await extractTextByXpathIfExist(
        browser,
        '//th[text()="電話番号"]/following-sibling::td'
      ),
      repeatCount: await extractTextByXpathIfExist(
        browser,
        '//th[text()="来店回数"]/following-sibling::td'
      ),
      note: await extractTextByXpathIfExist(
        browser,
        '//th[text()="お客様メモ"]/following-sibling::td'
      ),
      previousInfo: await extractTextByXpathIfExist(
        browser,
        '//th[text()="前回の施術情報"]/following-sibling::td'
      ),
    },
    sale: salesExists
      ? {
          id: await (
            await browser.findElement(By.id('salesId'))
          ).getAttribute('value'),
          time: await extractTextByXpathIfExist(
            browser,
            '//th[text()="会計日時"]/following-sibling::td'
          ),
          pic: await extractTextByXpathIfExist(
            browser,
            '//th[text()="レジ担当者"]/following-sibling::td'
          ),
          items: await (async () => {
            const elements = await browser.findElements(
              By.xpath('//tr[@class="reserveSales mod_middle"]')
            );

            const processElement = async (item: WebElement) => {
              return {
                category: await (
                  await item.findElement(By.xpath('./td[1]'))
                ).getText(),
                menu: await (
                  await item.findElement(By.xpath('./td[2]'))
                ).getText(),
                staff: await (
                  await item.findElement(By.xpath('./td[3]'))
                ).getText(),
                price: await (
                  await item.findElement(By.xpath('./td[4]'))
                ).getText(),
                units: await (
                  await item.findElement(By.xpath('./td[5]'))
                ).getText(),
                amount: await (
                  await item.findElement(By.xpath('./td[6]'))
                ).getText(),
              };
            };

            const results = [];
            for (const elm of elements) {
              results.push(await processElement(elm));
            }
            return results;
          })(),
        }
      : null,
  });
}
