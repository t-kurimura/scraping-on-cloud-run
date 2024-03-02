import { z } from 'zod';
import { err, ok, Result } from 'neverthrow';

import * as logger from '../../utils/logger';
import { storageClient, bucketName } from '../../infrastructure';

const zSavedCookie = z
  .object({
    name: z.string(),
    value: z.string(),
    path: z.string().optional(),
    domain: z.string().optional(),
    secure: z.boolean().optional(),
    httpOnly: z.boolean().optional(),
    expiry: z.union([z.number(), z.date()]).optional(),
  })
  .array();

export const saveLoginCookies = async (
  fileName: string,
  cookies: z.infer<typeof zSavedCookie>
) => {
  const bucket = storageClient.bucket(bucketName.cookies);
  const file = bucket.file(`login_cookies_${fileName}.json`);
  const stream = file.createWriteStream({
    metadata: {
      contentType: 'application/json',
    },
  });
  stream.write(JSON.stringify(cookies, null, 2));
  stream.end();
  stream.on('finish', () => {
    logger.info({
      message: 'Cookies saved to GCS.',
    });
  });
};

export const retrieveLoginCookies = async (
  fileName: string
): Promise<Result<z.infer<typeof zSavedCookie>, null>> => {
  const bucket = storageClient.bucket(bucketName.cookies);
  const file = bucket.file(`login_cookies_${fileName}.json`);
  const [exists] = await file.exists();
  if (!exists) {
    logger.info({
      message: 'Cookie file was not found',
    });
    return err(null);
  }

  const [contents] = await file.download();
  const parseResult = zSavedCookie.safeParse(
    JSON.parse(contents.toString('utf-8'))
  );

  if (!parseResult.success) {
    logger.error(
      {
        message: 'Cookie file was not found',
      },
      parseResult.error
    );
    return err(null);
  }
  return ok(parseResult.data);
};
