import { storageClient, bucketName } from '../../infrastructure';

export const uploadScreenshot = async (base64png: string, fileName: string) => {
  const bucket = storageClient.bucket(bucketName.screenshot);
  const file = bucket.file(`${fileName}.png`);
  await file.save(new Buffer(base64png, 'base64'));
};
