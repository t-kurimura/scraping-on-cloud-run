import express from 'express';
import dayjs from 'dayjs';
import { z } from 'zod';

import * as logger from './utils/logger';
import * as useCases from './use_cases';
import * as adapter from './adapters';

const app = express();

app.get('/salon_board/:salonId/reservations', async (req, res) => {
  const startAt = dayjs().format('YYYY-MM-DDTHH:mm:ss SSS [Z] A');
  const salonId = req.params.salonId;
  logger.info({
    message: 'requested',
    startAt,
    salonId,
  });
  const rangeParam = z
    .object({
      from: z
        .string()
        .regex(/^\d{4}\d{2}\d{2}$/, 'Invalid date format. Expected YYYYMMDD.'),
      to: z
        .string()
        .regex(/^\d{4}\d{2}\d{2}$/, 'Invalid date format. Expected YYYYMMDD.'),
    })
    .safeParse(req.query);
  if (!rangeParam.success) {
    res.status(401).json({
      message: 'Parameter invalid',
      startAt,
      query: req.query,
      err: rangeParam.error,
    });
    return;
  }

  const browser = adapter.createBrowser();
  const loginResult = await useCases.login(browser, salonId);
  logger.info({
    message: 'login flow completed',
    loginResult,
  });
  if (loginResult.isErr()) {
    await browser.quit();
    res.status(500).json({
      message: 'Login failed',
      ...loginResult,
      startAt,
    });
    return;
  }

  await useCases.collectReservations(browser, rangeParam.data, salonId);

  await browser.quit();
  res.json({
    message: 'Login completed',
    startAt,
    loginResult,
  });
});

app.get('/salon_board/:salonId/stylists', async (req, res) => {
  const startAt = dayjs().format('YYYY-MM-DDTHH:mm:ss SSS [Z] A');
  const salonId = req.params.salonId;
  logger.info({
    message: 'requested',
    startAt,
    salonId,
  });

  const browser = adapter.createBrowser();
  const loginResult = await useCases.login(browser, salonId);
  logger.info({
    message: 'login flow completed',
    loginResult,
  });
  if (loginResult.isErr()) {
    await browser.quit();
    res.status(500).json({
      message: 'Login failed',
      ...loginResult,
      startAt,
    });
    return;
  }

  await useCases.collectStylists(browser, salonId);

  res.json({
    message: 'Stylists completed',
    startAt,
  });
});

app.get('/salon_board/:salonId/coupons', async (req, res) => {
  const startAt = dayjs().format('YYYY-MM-DDTHH:mm:ss SSS [Z] A');
  const salonId = req.params.salonId;
  logger.info({
    message: 'requested coupons',
    startAt,
    salonId,
  });

  const browser = adapter.createBrowser();
  const loginResult = await useCases.login(
    browser,
    salonId,
    // 予約画面には行けるが、掲載情報画面にはいけないことがある
    // ログイン時に掲載画面まで確認するハンドリングを書くべきがだが、
    // クーポン取得頻度は低いはずなので毎回ログイン処理する
    true
  );
  logger.info({
    message: 'login flow complete',
    loginResult,
  });
  if (loginResult.isErr()) {
    await browser.quit();
    res.status(500).json({
      message: 'Login failed',
      ...loginResult,
      startAt,
    });
    return;
  }

  await useCases.collectCoupons(browser, salonId);

  res.json({
    message: 'Coupons completed',
    startAt,
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
