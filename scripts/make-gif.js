const puppeteer = require('puppeteer-core');
const GIFEncoder = require('gif-encoder-2');
const { PNG } = require('pngjs');
const path = require('path');
const fs = require('fs');

const htmlFile = path.resolve(__dirname, '../chenze-skill-animation.html');
const outputFile = path.resolve(__dirname, '../chenze-skill-animation.gif');

const FPS = 10;
const DURATION = 15;
const TOTAL_FRAMES = DURATION * FPS;
const FRAME_DELAY = Math.round(1000 / FPS);
const WIDTH = 800;
const HEIGHT = 450;

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  await page.evaluateOnNewDocument(() => {
    window.__recording = true;
  });

  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');
  console.log('Loading:', fileUrl);
  await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('Waiting for animation to start...');
  await new Promise(r => setTimeout(r, 2000));

  const encoder = new GIFEncoder(WIDTH, HEIGHT, 'neuquant', true);
  encoder.setDelay(FRAME_DELAY);
  encoder.setQuality(15);
  encoder.setRepeat(0);
  encoder.start();

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps...`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const screenshot = await page.screenshot({ type: 'png' });
    const png = PNG.sync.read(screenshot);
    encoder.addFrame(png.data);

    if (i % 10 === 0) {
      process.stdout.write(`\rFrame ${i + 1}/${TOTAL_FRAMES}`);
    }

    if (i < TOTAL_FRAMES - 1) {
      await new Promise(r => setTimeout(r, FRAME_DELAY));
    }
  }

  encoder.finish();
  const buffer = encoder.out.getData();
  fs.writeFileSync(outputFile, buffer);

  await browser.close();
  console.log(`\nDone! GIF saved: ${outputFile} (${(buffer.length / 1024).toFixed(0)} KB)`);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
