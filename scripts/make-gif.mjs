import puppeteer from '../node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import { createCanvas, createImageData } from 'canvas';
import GIFEncoder from 'gif-encoder-2';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// since we may not have canvas, use a simpler approach with just puppeteer + manual GIF
// Let's use the @puppeteer approach with screenshots

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.resolve(__dirname, '../chenze-skill-animation.html');
const outputPath = path.resolve(__dirname, '../chenze-skill-animation.gif');

const FPS = 12;
const DURATION = 15; // seconds
const TOTAL_FRAMES = DURATION * FPS;
const WIDTH = 800;
const HEIGHT = 450;

async function main() {
  console.log('Launching browser...');

  // Try to find puppeteer
  let launch;
  try {
    const { default: pup } = await import('../node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js');
    launch = pup;
  } catch(e) {
    console.log('ESM import failed, trying CJS...');
  }

  const puppeteerMod = await import('../node_modules/puppeteer/lib/cjs/puppeteer/puppeteer.js').catch(() => null)
    || await import('../node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js').catch(() => null);

  console.log(Object.keys(puppeteerMod || {}));
}

main().catch(console.error);
