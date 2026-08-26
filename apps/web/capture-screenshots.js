const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const routes = [
  '/',
  '/about',
  '/departments',
  '/doctors',
  '/facilities',
  '/testimonials',
  '/faq',
  '/contact'
];

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, 'screenshots');

(async () => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  // We launch chromium.
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 }
  });

  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Scroll down the page to trigger all scroll animations
      console.log(`Scrolling ${route} to trigger animations...`);
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 300; // Scroll distance per step
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight - window.innerHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
        
        // Scroll back to top
        window.scrollTo(0, 0);
      });
      
      // Wait a bit for framer-motion animations to settle after scrolling
      await page.waitForTimeout(2000);
      
      const fileName = route === '/' ? 'home.png' : `${route.replace('/', '')}.png`;
      const filePath = path.join(OUT_DIR, fileName);
      
      console.log(`Capturing full page screenshot to ${fileName}...`);
      await page.screenshot({ path: filePath, fullPage: true });
    } catch (e) {
      console.error(`Failed to capture ${route}:`, e);
    }
  }

  await browser.close();
  console.log('Done capturing all screenshots! They are saved in the "screenshots" folder.');
})();
