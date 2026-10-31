import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { envVars } from "@crawl/env";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";

const TARGET_BROWSER_CHROME = "chrome";
const TARGET_BROWSER_FIREFOX = "firefox";
const FIREFOX_GECKO_ID = "hello-world@example.com";
const FIREFOX_STRICT_MIN_VERSION = "115.0";
const WEB_EXT_TARGET_CHROMIUM = "chromium";
const WEB_EXT_TARGET_FIREFOX_DESKTOP = "firefox-desktop";
const WEB_EXT_CHROMIUM_PROFILE_DIR_NAME = ".webext-profile";
const WEB_EXT_FIREFOX_PROFILE_DIR_NAME = ".webext-firefox-profile";
const WEB_EXT_USER_DATA_DIR_FLAG_PREFIX = "--user-data-dir=";
const WEB_EXT_NO_FIRST_RUN_FLAG = "--no-first-run";
const WEB_EXT_NO_DEFAULT_BROWSER_CHECK_FLAG = "--no-default-browser-check";
const BUILD_TARGET = "es2022";
const CHROMIUM_OUT_DIR = "dist/chromium";
const FIREFOX_OUT_DIR = "dist/firefox";
const CHROMIUM_BINARY_CANDIDATES = [
  "/opt/google/chrome/chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
] as const;
const FIREFOX_BINARY_CANDIDATES = [
  "/usr/lib/firefox/firefox",
  "/usr/bin/firefox",
  "/usr/bin/firefox-esr",
  "/opt/firefox/firefox",
  path.join(os.homedir(), ".cache", "crawl-crawler", "firefox", "firefox"),
] as const;

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));

type TargetBrowser = typeof TARGET_BROWSER_CHROME | typeof TARGET_BROWSER_FIREFOX;

interface ExtensionManifest {
  manifest_version: number;
  name: string;
  version: string;
  description: string;
  action: {
    default_popup: string;
    default_icon: Record<string, string>;
  };
  icons: Record<string, string>;
  browser_specific_settings?: {
    gecko: {
      id: string;
      strict_min_version: string;
    };
  };
}

function resolveTargetBrowser(rawTargetBrowser: string | undefined): TargetBrowser {
  if (rawTargetBrowser === TARGET_BROWSER_FIREFOX) {
    return TARGET_BROWSER_FIREFOX;
  }

  return TARGET_BROWSER_CHROME;
}

function resolveExistingBinary(
  envBinaryPath: string | undefined,
  binaryCandidates: readonly string[],
): string | undefined {
  if (envBinaryPath !== undefined && envBinaryPath !== "") {
    return envBinaryPath;
  }

  for (const binaryCandidate of binaryCandidates) {
    if (existsSync(binaryCandidate)) {
      return binaryCandidate;
    }
  }

  return undefined;
}

function loadManifest(targetBrowser: TargetBrowser): ExtensionManifest {
  const manifestPath = path.join(packageDirectory, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as ExtensionManifest;

  if (targetBrowser === TARGET_BROWSER_FIREFOX) {
    manifest.browser_specific_settings = {
      gecko: {
        id: FIREFOX_GECKO_ID,
        strict_min_version: FIREFOX_STRICT_MIN_VERSION,
      },
    };
  }

  return manifest;
}

const targetBrowser = resolveTargetBrowser(process.env.TARGET_BROWSER);
const outputDirectory =
  targetBrowser === TARGET_BROWSER_FIREFOX ? FIREFOX_OUT_DIR : CHROMIUM_OUT_DIR;
const chromiumBinaryPath = resolveExistingBinary(
  process.env.CHROMIUM_BINARY,
  CHROMIUM_BINARY_CANDIDATES,
);
const firefoxBinaryPath = resolveExistingBinary(
  process.env.FIREFOX_BINARY,
  FIREFOX_BINARY_CANDIDATES,
);
const chromiumProfile = path.resolve(packageDirectory, WEB_EXT_CHROMIUM_PROFILE_DIR_NAME);
const firefoxProfile = path.resolve(packageDirectory, WEB_EXT_FIREFOX_PROFILE_DIR_NAME);

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: () => loadManifest(targetBrowser),
      browser: targetBrowser,
      htmlViteConfig: {
        build: {
          outDir: outputDirectory,
          minify: false,
          target: BUILD_TARGET,
        },
      },
      webExtConfig: {
        target:
          targetBrowser === TARGET_BROWSER_FIREFOX
            ? WEB_EXT_TARGET_FIREFOX_DESKTOP
            : WEB_EXT_TARGET_CHROMIUM,
        startUrl: envVars.WEB_EXT_START_URL,
        chromiumBinary: chromiumBinaryPath,
        // web-ext-run reads `firefox`; newer typings also expose `firefoxBinary`.
        firefox: firefoxBinaryPath,
        firefoxBinary: firefoxBinaryPath,
        profileCreateIfMissing: true,
        keepProfileChanges: true,
        ...(targetBrowser === TARGET_BROWSER_CHROME
          ? {
              args: [
                `${WEB_EXT_USER_DATA_DIR_FLAG_PREFIX}${chromiumProfile}`,
                WEB_EXT_NO_FIRST_RUN_FLAG,
                WEB_EXT_NO_DEFAULT_BROWSER_CHECK_FLAG,
              ],
              chromiumProfile,
            }
          : {
              firefoxProfile,
            }),
      },
    }),
  ],
  build: {
    target: BUILD_TARGET,
    minify: false,
    outDir: outputDirectory,
  },
});
