import { By, WebDriver } from 'selenium-webdriver';

export const extractTextByXpathIfExist = async (
  browser: WebDriver,
  elementLocator: string
): Promise<string | null> => {
  const elements = await browser.findElements(By.xpath(elementLocator));
  if (elements.length === 0) {
    return null;
  }
  return await elements[0].getText();
};
