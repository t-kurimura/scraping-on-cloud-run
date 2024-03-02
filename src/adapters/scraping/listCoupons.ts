import { By, until, WebDriver, WebElement, error } from 'selenium-webdriver';

type Coupon = {
  order: string | null;
  presentFlg: string | null;
  imageUrl: string;
  type: string;
  name: string;
  expirationDate: string;
  status: string;
  couponId: string;
};

const safeAccessorToValueAttr = async (
  baseElm: WebElement,
  cssPath: string
): Promise<WebElement | null> => {
  try {
    return await baseElm.findElement(By.css(cssPath));
  } catch (e: unknown) {
    if (e instanceof error.NoSuchElementError) {
      return null;
    }
    throw e;
  }
};

export async function listCoupons(
  browser: WebDriver,
  screenshot: {
    takeAndUpload: (browser: WebDriver, fileName: string) => Promise<void>;
  }
): Promise<{ [key: string]: Coupon }> {
  await browser.get('https://sample.com/CNK/draft/couponList/');
  await screenshot.takeAndUpload(browser, 'couponList');
  await browser.wait(
    until.elementLocated(By.css('table.table_list_store.mt10')),
    5000
  );

  const couponRows = await browser.findElements(
    By.css('table.table_list_store.mt10 tbody tr')
  );
  const coupons: { [couponId: string]: Coupon } = {};
  for (const row of couponRows) {
    const couponIdInput = await safeAccessorToValueAttr(
      row,
      'input[name*=".couponId"]'
    );
    if (couponIdInput) {
      const couponId = await couponIdInput.getAttribute('value');
      const seq = await safeAccessorToValueAttr(row, 'input[name*=".seq"]');
      const order = seq !== null ? await seq.getAttribute('value') : null;
      const present = await safeAccessorToValueAttr(
        row,
        'input[name*=".presentFlg"]'
      );
      const presentFlg =
        present !== null ? await present.getAttribute('value') : null;
      const imageUrl = await (
        await row.findElement(By.css('img[name="couponPhoto"]'))
      ).getAttribute('src');
      const type = await (await row.findElement(By.xpath('./td[3]'))).getText();
      const name = await (await row.findElement(By.xpath('./td[4]'))).getText();
      const expirationDate = await (
        await row.findElement(By.xpath('./td[5]'))
      ).getText();
      const status = await (
        await row.findElement(By.xpath('./td[6]'))
      ).getText();
      coupons[couponId] = {
        order,
        presentFlg,
        imageUrl,
        type,
        name,
        expirationDate,
        status,
        couponId,
      };
    }
  }

  return coupons;
}
