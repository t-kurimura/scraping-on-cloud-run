import { z } from 'zod';

export const schema = {
  salons: {
    name: 'salons',
    schema: z.object({}),
  },
  sampleBoards: {
    name: 'sampleBoards',
    schema: z.object({
      id: z.string(),
      password: z.string(),
      scraping: z.object({
        status: z.union([
          z.literal('green'),
          z.literal('red'),
          z.literal('yellow'),
        ]),
        yellowDetectedTime: z.date().nullable(),
        redDetectedTime: z.date().nullable(),
      }),
    }),
  },
  reservations: {
    name: 'reservations',
    schema: z.object({
      metadata: z.object({
        createdAt: z.date(),
      }),
    }),
  },
  listedReservation: {
    name: 'listed',
    schema: z.object({
      status: z.string(),
      staff: z.string(),
      time: z.object({
        start: z.date(),
      }),
      name: z.string(),
    }),
  },
  reservationDetail: {
    name: 'detail',
    schema: z.object({
      id: z.string(),
      status: z.string().nullable(),
      time: z.object({
        start: z.date().nullable(),
        end: z.date().nullable(),
      }),
      source: z.string().nullable(),
      options: z.string().nullable(),
      staff: z.string().nullable(),
      facilities: z.string().nullable(),
      customerNumber: z.string().nullable(),
      customerId: z.string(),
      coupon: z.object({
        name: z.string().nullable(),
        description: z.string().nullable(),
        conditions: z.object({
          note: z.string().nullable(),
          expiration: z.string().nullable(),
          usage: z.string().nullable(),
        }),
      }),
      favor: z.object({
        gender: z.string().nullable(),
        request: z.string().nullable(),
        first_time: z.string().nullable(),
        note: z.string().nullable(),
        question: z.string().nullable(),
        response: z.string().nullable(),
      }),
      note: z.object({
        atReservation: z.string().nullable(),
        forNext: z.string().nullable(),
      }),
      hbContacts: z.string().nullable(),
    }),
  },
  customers: {
    name: 'customers',
    schema: z.object({
      id: z.string(),
      nameKana: z.string().nullable(),
      nameKanji: z.string().nullable(),
      phoneNumber: z.string().nullable(),
      repeatCount: z.string().nullable(),
      note: z.string().nullable(),
      previousInfo: z.string().nullable(),
      gender: z.string().nullable(),
      birthday: z.string().nullable(),
    }),
  },
  coupons: {
    name: 'coupons',
    schema: z.object({
      order: z.string().nullable(),
      presentFlg: z.string().nullable(),
      imageUrl: z.string(),
      type: z.string(),
      name: z.string(),
      expirationDate: z.string(),
      status: z.string(),
      couponId: z.string(),
    }),
  },
  stylists: {
    name: 'stylists',
    schema: z.object({
      id: z.string(),
      name: z.string(),
    }),
  },
} as const;
