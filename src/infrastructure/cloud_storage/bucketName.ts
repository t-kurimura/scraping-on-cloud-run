const projectId = process.env.GOOGLE_CLOUD_PROJECT;
export const bucketName = {
  screenshot: `${projectId}-screenshots`,
  cookies: `${projectId}-cookies`,
} as const;
