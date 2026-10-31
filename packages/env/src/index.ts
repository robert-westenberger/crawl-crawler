import { existsSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const NODE_ENV_PRODUCTION = "production";
const NODE_ENV_DEVELOPMENT = "development";
const ENV_FILE_PREFIX = ".env_";

const NodeEnvSchema = z.enum([NODE_ENV_PRODUCTION, NODE_ENV_DEVELOPMENT]);

function findEnvFilePath(envFileName: string): string {
  let currentDirectory = path.resolve(process.cwd());

  while (true) {
    const candidatePath = path.join(currentDirectory, envFileName);
    if (existsSync(candidatePath)) {
      return candidatePath;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      throw new Error(`Environment file ${envFileName} was not found`);
    }

    currentDirectory = parentDirectory;
  }
}

const nodeEnv = NodeEnvSchema.parse(process.env.NODE_ENV);
const envFileName = `${ENV_FILE_PREFIX}${nodeEnv}`;
const envFilePath = findEnvFilePath(envFileName);

config({ path: envFilePath, quiet: true });

const EnvVarsSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  WEB_EXT_START_URL: z.url(),
});

export const envVars = EnvVarsSchema.parse(process.env);
export type EnvVars = z.infer<typeof EnvVarsSchema>;
