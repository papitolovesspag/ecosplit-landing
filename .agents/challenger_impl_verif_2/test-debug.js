const { chromium } = require('@playwright/test');

async function debugCanvas() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });

  try {
    console.log('Navigating to http://127.0.0.1:3000/...');
    await page.goto('http://127.0.0.1:3000/');
    
    console.log('Waiting 3 seconds for dynamic import/WebGL to load...');
    await page.waitForTimeout(3000);

    const canvas = page.locator('canvas#webgl-background');
    const exists = await canvas.count() > 0;
    console.log(`Canvas exists in DOM: ${exists}`);

    if (exists) {
      const isVisible = await canvas.isVisible();
      console.log(`Canvas isVisible(): ${isVisible}`);
      
      const boundingBox = await canvas.boundingBox();
      console.log(`Canvas bounding box: ${JSON.stringify(boundingBox)}`);
      
      const computedStyle = await canvas.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          zIndex: style.zIndex,
          position: style.position,
          width: style.width,
          height: style.height
        };
      });
      console.log(`Canvas computed style: ${JSON.stringify(computedStyle)}`);
    } else {
      console.log('Canvas not found!');
    }
  } catch (error) {
    console.error('Error during debug run:', error);
  } finally {
    await browser.close();
  }
}

debugCanvas();
