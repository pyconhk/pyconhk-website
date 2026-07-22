import { env } from "cloudflare:workers";

import { type CmsEnvironment, readCmsEnvironment } from "./env";

export function getRuntimeEnvironment(): CmsEnvironment {
  return readCmsEnvironment(env);
}
