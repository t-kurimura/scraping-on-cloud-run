import { By, until, WebDriver } from 'selenium-webdriver';
type Stylist = {
  name: string;
  id: string;
};

export async function listStylists(
  browser: WebDriver,
  screenshot: {
    takeAndUpload: (browser: WebDriver, fileName: string) => Promise<void>;
  }
): Promise<{ [key: string]: Stylist }> {
  await browser.get('https://sample.com/KLP/reserve/reserveList/');
  await browser.wait(until.elementLocated(By.id('mod_box_05_reserve')), 5000);

  await screenshot.takeAndUpload(browser, 'stylists');

  const stylistElements = await browser.findElements(
    By.xpath('//select[@id="stylistId"]/option')
  );
  const stylists: { [stylistId: string]: Stylist } = {};
  for (const elm of stylistElements) {
    const stylistId = await elm.getAttribute('value');
    if (!stylistId) {
      continue;
    }
    stylists[stylistId] = {
      name: await elm.getText(),
      id: stylistId,
    };
  }
  return stylists;
}
