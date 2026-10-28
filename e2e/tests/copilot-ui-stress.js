const { chromium } = require('@playwright/test');

async function runCopilotUiStressTests() {
  console.log('========================================================');
  console.log('  ECOSPLIT AI - DEMO COPILOT & UI EMPIRICAL STRESS SUITE');
  console.log('========================================================\n');

  let browser;
  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  function record(testName, status, details = '') {
    if (status === 'PASS') {
      passedCount++;
      console.log(`  \x1b[32m[PASS]\x1b[0m ${testName}`);
    } else {
      failedCount++;
      console.log(`  \x1b[31m[FAIL]\x1b[0m ${testName} -> ${details}`);
    }
    results.push({ testName, status, details });
  }

  try {
    browser = await chromium.launch({
      channel: 'msedge',
      headless: true,
    });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    // Collect console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    console.log('--- Phase 1: Initial Page Load & Telemetry Mounting ---');
    await page.goto('http://localhost:3000/demo', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.demo-title-wrap h1', { timeout: 10000 });

    // Test 1: Page title and header
    const title = await page.textContent('.demo-title-wrap h1');
    if (title && title.includes('EcoSplit AI')) {
      record('Demo Portal Mount & Header Render', 'PASS');
    } else {
      record('Demo Portal Mount & Header Render', 'FAIL', `Unexpected title: ${title}`);
    }

    // Test 2: Initial Grid Status
    const initialStatus = await page.textContent('.demo-brand-group span:has-text("Grid:")');
    if (initialStatus && initialStatus.includes('Grid: ONLINE')) {
      record('Initial Grid Status Pill (ONLINE)', 'PASS');
    } else {
      record('Initial Grid Status Pill (ONLINE)', 'FAIL', `Expected ONLINE, got ${initialStatus}`);
    }

    // Test 3: Initial Copilot Welcome Message
    const initialMsg = await page.textContent('.copilot-stream .chat-bubble.copilot');
    if (initialMsg && initialMsg.includes('OpenADR 2.0b telemetry stream')) {
      record('Initial Co-Pilot Telemetry Welcome Message', 'PASS');
    } else {
      record('Initial Co-Pilot Telemetry Welcome Message', 'FAIL', `Message not found or mismatch: ${initialMsg}`);
    }

    // Wait for Next.js Turbopack to compile client bundle and complete hydration
    console.log('Waiting for client hydration...');
    await page.waitForTimeout(3500);

    console.log('\n--- Phase 2: Testing 4 Executable Quick Prompt Pills ---');
    const pillButtons = await page.$$('.pill-action-btn');
    if (pillButtons.length === 4) {
      record('4 Quick Prompt Pills Rendered in DOM', 'PASS');
    } else {
      record('4 Quick Prompt Pills Rendered in DOM', 'FAIL', `Found ${pillButtons.length} pills, expected 4`);
    }

    // Pill 1: Optimize for peak tariff
    await pillButtons[0].click();
    await page.waitForTimeout(600); // Wait for simulated inference latency (~84-118ms) + state render
    
    // Check user bubble and copilot response
    const bubblesAfterOpt = await page.$$eval('.copilot-stream .chat-bubble', els => els.map(e => e.innerText));
    const lastUserOpt = bubblesAfterOpt[bubblesAfterOpt.length - 2] || '';
    const lastCopilotOpt = bubblesAfterOpt[bubblesAfterOpt.length - 1] || '';
    
    const threshValOpt = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    const battSplitOpt = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);
    const tariffValOpt = await page.$eval('.controls-grid .ctrl-group:nth-child(3) .ctrl-val', el => el.innerText);

    if (
      lastCopilotOpt.includes('Optimization Complete') &&
      lastCopilotOpt.includes('Clamped grid threshold to 5.5 kW') &&
      threshValOpt.includes('5.5 kW') &&
      battSplitOpt.includes('85%') &&
      tariffValOpt.includes('$0.58')
    ) {
      record('Pill 1: "Optimize for peak tariff" mutates state and yields report', 'PASS');
    } else {
      record('Pill 1: "Optimize for peak tariff" mutates state and yields report', 'FAIL', 
        `Mismatch: Thresh=${threshValOpt}, Batt=${battSplitOpt}, Tariff=${tariffValOpt}, Resp=${lastCopilotOpt.slice(0, 100)}`);
    }

    // Pill 2: Diagnose load anomaly
    await pillButtons[1].click();
    await page.waitForTimeout(400);
    const bubblesAfterDiag = await page.$$eval('.copilot-stream .chat-bubble', els => els.map(e => e.innerText));
    const lastCopilotDiag = bubblesAfterDiag[bubblesAfterDiag.length - 1] || '';
    if (
      lastCopilotDiag.includes('Diagnostics Telemetry Report') &&
      lastCopilotDiag.includes('Phase B sub-meter') &&
      lastCopilotDiag.includes('Anomaly Score: 0.94')
    ) {
      record('Pill 2: "Diagnose load anomaly" yields diagnostic report', 'PASS');
    } else {
      record('Pill 2: "Diagnose load anomaly" yields diagnostic report', 'FAIL', `Resp=${lastCopilotDiag.slice(0, 100)}`);
    }

    // Pill 3: Simulate grid outage (Microgrid Islanding)
    await pillButtons[2].click();
    await page.waitForTimeout(400);
    const bubblesAfterOutage = await page.$$eval('.copilot-stream .chat-bubble', els => els.map(e => e.innerText));
    const lastCopilotOutage = bubblesAfterOutage[bubblesAfterOutage.length - 1] || '';
    const statusTextOutage = await page.textContent('.demo-brand-group span:has-text("Grid:")');
    const battSplitOutage = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);
    const activeGridKpiOutage = await page.$eval('.kpi-row .kpi-card:nth-child(1) .kpi-val', el => el.innerText);

    if (
      lastCopilotOutage.includes('GRID LOSS DETECTED: Microgrid Islanding Engaged') &&
      statusTextOutage.includes('Grid: ISLANDED') &&
      battSplitOutage.includes('100%') &&
      activeGridKpiOutage.includes('0.0')
    ) {
      record('Pill 3: "Simulate grid outage" islands microgrid & zeroes grid draw', 'PASS');
    } else {
      record('Pill 3: "Simulate grid outage" islands microgrid & zeroes grid draw', 'FAIL', 
        `Status=${statusTextOutage}, Batt=${battSplitOutage}, GridKPI=${activeGridKpiOutage}`);
    }

    // Pill 4: Forecast tomorrow peak
    await pillButtons[3].click();
    await page.waitForTimeout(400);
    const bubblesAfterFc = await page.$$eval('.copilot-stream .chat-bubble', els => els.map(e => e.innerText));
    const lastCopilotFc = bubblesAfterFc[bubblesAfterFc.length - 1] || '';
    const battSocKpi = await page.$eval('.kpi-row .kpi-card:nth-child(2) .kpi-meta', el => el.innerText);

    if (
      lastCopilotFc.includes('24-Hour Predictive Neural Forecast') &&
      lastCopilotFc.includes('NOAA Weather API') &&
      battSocKpi.includes('95%')
    ) {
      record('Pill 4: "Forecast tomorrow peak" sets 95% SoC precharge strategy', 'PASS');
    } else {
      record('Pill 4: "Forecast tomorrow peak" sets 95% SoC precharge strategy', 'FAIL', 
        `SocKpi=${battSocKpi}, Resp=${lastCopilotFc.slice(0, 100)}`);
    }

    console.log('\n--- Phase 3: Testing 4 Operational Presets ---');
    const presetButtons = await page.$$('.preset-btn');
    if (presetButtons.length === 4) {
      record('4 Operational Presets Rendered in DOM', 'PASS');
    } else {
      record('4 Operational Presets Rendered in DOM', 'FAIL', `Expected 4, got ${presetButtons.length}`);
    }

    // Preset 1: Peak Tariff Arbitrage
    await presetButtons[0].click();
    await page.waitForTimeout(200);
    const p1Active = await presetButtons[0].getAttribute('class');
    const p1BaseLoad = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    const p1Thresh = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    const p1Tariff = await page.$eval('.controls-grid .ctrl-group:nth-child(3) .ctrl-val', el => el.innerText);
    const p1Batt = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);

    if (
      p1Active.includes('active') &&
      p1BaseLoad.includes('14.5') &&
      p1Thresh.includes('6.5') &&
      p1Tariff.includes('$0.58') &&
      p1Batt.includes('80%')
    ) {
      record('Preset 1: Peak Tariff Arbitrage correctly configures simulator parameters', 'PASS');
    } else {
      record('Preset 1: Peak Tariff Arbitrage correctly configures simulator parameters', 'FAIL', 
        `Base=${p1BaseLoad}, Thresh=${p1Thresh}, Tariff=${p1Tariff}, Batt=${p1Batt}`);
    }

    // Preset 2: Green Grid / Low Carbon
    await presetButtons[1].click();
    await page.waitForTimeout(200);
    const p2Active = await presetButtons[1].getAttribute('class');
    const p2BaseLoad = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    const p2Thresh = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    const p2Tariff = await page.$eval('.controls-grid .ctrl-group:nth-child(3) .ctrl-val', el => el.innerText);
    const p2Batt = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);

    if (
      p2Active.includes('active') &&
      p2BaseLoad.includes('10.0') &&
      p2Thresh.includes('4.5') &&
      p2Tariff.includes('$0.32') &&
      p2Batt.includes('45%')
    ) {
      record('Preset 2: Green Grid / Low Carbon shifts load to 45% BESS & 55% deferral', 'PASS');
    } else {
      record('Preset 2: Green Grid / Low Carbon shifts load to 45% BESS & 55% deferral', 'FAIL', 
        `Base=${p2BaseLoad}, Thresh=${p2Thresh}, Tariff=${p2Tariff}, Batt=${p2Batt}`);
    }

    // Preset 3: Critical Grid Stress / Peaker Event
    await presetButtons[2].click();
    await page.waitForTimeout(200);
    const p3Active = await presetButtons[2].getAttribute('class');
    const p3BaseLoad = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    const p3Thresh = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    const p3Tariff = await page.$eval('.controls-grid .ctrl-group:nth-child(3) .ctrl-val', el => el.innerText);
    const p3Batt = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);
    const p3GridStatus = await page.textContent('.demo-brand-group span:has-text("Grid:")');

    if (
      p3Active.includes('active') &&
      p3BaseLoad.includes('18.0') &&
      p3Thresh.includes('4.0') &&
      p3Tariff.includes('$0.72') &&
      p3Batt.includes('95%') &&
      p3GridStatus.includes('PEAKER_ALERT')
    ) {
      record('Preset 3: Critical Grid Stress activates PEAKER_ALERT & 95% battery split', 'PASS');
    } else {
      record('Preset 3: Critical Grid Stress activates PEAKER_ALERT & 95% battery split', 'FAIL', 
        `Base=${p3BaseLoad}, Thresh=${p3Thresh}, Tariff=${p3Tariff}, Batt=${p3Batt}, Grid=${p3GridStatus}`);
    }

    // Preset 4: EV Fleet & Heavy Spike
    await presetButtons[3].click();
    await page.waitForTimeout(200);
    const p4Active = await presetButtons[3].getAttribute('class');
    const p4BaseLoad = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    const p4Thresh = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    const p4Tariff = await page.$eval('.controls-grid .ctrl-group:nth-child(3) .ctrl-val', el => el.innerText);
    const p4Batt = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);

    if (
      p4Active.includes('active') &&
      p4BaseLoad.includes('24.0') &&
      p4Thresh.includes('10.0') &&
      p4Tariff.includes('$0.48') &&
      p4Batt.includes('65%')
    ) {
      record('Preset 4: EV Fleet & Heavy Spike sets 24kW load with 10kW threshold', 'PASS');
    } else {
      record('Preset 4: EV Fleet & Heavy Spike sets 24kW load with 10kW threshold', 'FAIL', 
        `Base=${p4BaseLoad}, Thresh=${p4Thresh}, Tariff=${p4Tariff}, Batt=${p4Batt}`);
    }

    console.log('\n--- Phase 4: Testing Freeform User Chat Inputs ---');
    async function sendChat(text) {
      await page.fill('.copilot-input', text);
      await page.click('.copilot-submit-btn');
      await page.waitForTimeout(350); // wait for response
      const msgs = await page.$$eval('.copilot-stream .chat-bubble', els => els.map(e => e.innerText));
      return msgs[msgs.length - 1] || '';
    }

    // 4.1 Numerical threshold command
    const respThresh = await sendChat('set threshold to 8.5 kW');
    const threshValChat = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    if (respThresh.includes('8.5 kW') && threshValChat.includes('8.5 kW')) {
      record('Chat Command: "set threshold to 8.5 kW" parses and updates threshold', 'PASS');
    } else {
      record('Chat Command: "set threshold to 8.5 kW" parses and updates threshold', 'FAIL', 
        `Resp=${respThresh.slice(0, 80)}, Val=${threshValChat}`);
    }

    // 4.2 Numerical load command
    const respLoad = await sendChat('set load to 21 kW');
    const loadValChat = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    if (respLoad.includes('21.0 kW') && loadValChat.includes('21.0 kW')) {
      record('Chat Command: "set load to 21 kW" parses and updates base facility load', 'PASS');
    } else {
      record('Chat Command: "set load to 21 kW" parses and updates base facility load', 'FAIL', 
        `Resp=${respLoad.slice(0, 80)}, Val=${loadValChat}`);
    }

    // 4.3 Numerical battery split command
    const respBatt = await sendChat('set battery to 75%');
    const battValChat = await page.$eval('.controls-grid .ctrl-group:nth-child(4) .ctrl-val', el => el.innerText);
    if (respBatt.includes('75%') && battValChat.includes('75%')) {
      record('Chat Command: "set battery to 75%" parses and updates BESS storage split', 'PASS');
    } else {
      record('Chat Command: "set battery to 75%" parses and updates BESS storage split', 'FAIL', 
        `Resp=${respBatt.slice(0, 80)}, Val=${battValChat}`);
    }

    // 4.4 Out of bounds clamping check
    await sendChat('set load to 50 kW');
    const loadClamped = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    if (loadClamped.includes('25.0 kW')) {
      record('Chat Boundary: Load value 50 kW clamped to upper physical bound 25.0 kW', 'PASS');
    } else {
      record('Chat Boundary: Load value 50 kW clamped to upper physical bound 25.0 kW', 'FAIL', `Got ${loadClamped}`);
    }

    await sendChat('set threshold to 0.5 kW');
    const threshClamped = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    if (threshClamped.includes('2.0 kW')) {
      record('Chat Boundary: Threshold 0.5 kW clamped to lower bound 2.0 kW', 'PASS');
    } else {
      record('Chat Boundary: Threshold 0.5 kW clamped to lower bound 2.0 kW', 'FAIL', `Got ${threshClamped}`);
    }

    // 4.5 Reset command
    const respReset = await sendChat('reset simulation');
    const baseReset = await page.$eval('.controls-grid .ctrl-group:nth-child(1) .ctrl-val', el => el.innerText);
    const threshReset = await page.$eval('.controls-grid .ctrl-group:nth-child(2) .ctrl-val', el => el.innerText);
    if (respReset.includes('Simulation parameters restored') && baseReset.includes('12.5') && threshReset.includes('7.5')) {
      record('Chat Command: "reset simulation" restores default telemetry baseline', 'PASS');
    } else {
      record('Chat Command: "reset simulation" restores default telemetry baseline', 'FAIL', 
        `Base=${baseReset}, Thresh=${threshReset}`);
    }

    // 4.6 Unhandled / General Query
    const respQuery = await sendChat('What is the current system efficiency?');
    if (respQuery.includes('Energy Intelligence Query') && respQuery.includes('EcoSplit Neural Engine')) {
      record('Chat General Intelligence Fallback handles unmapped natural language queries gracefully', 'PASS');
    } else {
      record('Chat General Intelligence Fallback handles unmapped natural language queries gracefully', 'FAIL', 
        `Resp=${respQuery.slice(0, 80)}`);
    }

    // 4.7 Form submission button disabled state when input is empty
    const submitBtnDisabled = await page.$eval('.copilot-submit-btn', el => el.disabled);
    if (submitBtnDisabled) {
      record('Chat Input: Submit button is disabled when input field is empty', 'PASS');
    } else {
      record('Chat Input: Submit button is disabled when input field is empty', 'FAIL', 'Expected disabled=true');
    }

    console.log('\n--- Phase 5: Testing 24-Hour SVG Waveform Scrubber ---');
    // Check waveform presence
    const waveformSvg = await page.$('.waveform-chart-svg');
    if (waveformSvg) {
      record('24-Hour Waveform SVG Rendered in DOM', 'PASS');
    } else {
      record('24-Hour Waveform SVG Rendered in DOM', 'FAIL', 'Waveform SVG not found');
    }

    // Initial label check
    const initialWaveformLabel = await page.textContent('.waveform-container ~ .chart-legend, .glass-box:has(.waveform-container) .box-title span:last-child');
    // Hover sensor rects (24 hours)
    const hourSensors = await page.$$('.waveform-chart-svg rect[fill="transparent"]');
    if (hourSensors.length === 24) {
      record('24 Diurnal Hour Scrubbing Hitboxes Rendered', 'PASS');
    } else {
      record('24 Diurnal Hour Scrubbing Hitboxes Rendered', 'FAIL', `Found ${hourSensors.length} hitboxes, expected 24`);
    }

    // Test hovering over hour 17 (Peak Hour)
    if (hourSensors.length >= 18) {
      await hourSensors[17].hover();
      await page.waitForTimeout(150);
      const hoverLabel17 = await page.textContent('.glass-box:has(.waveform-container) .box-title > span');
      const hasInspectionDots = await page.$$eval('.waveform-chart-svg circle', circles => circles.length);

      if (hoverLabel17 && hoverLabel17.includes('Hour 17:00') && hoverLabel17.includes('Base') && hasInspectionDots >= 2) {
        record('Waveform Scrubber: Hovering Hour 17:00 updates telemetry inspector & renders cursor indicator', 'PASS');
      } else {
        record('Waveform Scrubber: Hovering Hour 17:00 updates telemetry inspector & renders cursor indicator', 'FAIL', 
          `Label=${hoverLabel17}, DotsCount=${hasInspectionDots}`);
      }

      // Test hovering over hour 3 (Off-peak replenishment)
      await hourSensors[3].hover();
      await page.waitForTimeout(150);
      const hoverLabel3 = await page.textContent('.glass-box:has(.waveform-container) .box-title > span');
      if (hoverLabel3 && hoverLabel3.includes('Hour 03:00')) {
        record('Waveform Scrubber: Hovering Hour 03:00 updates telemetry inspector', 'PASS');
      } else {
        record('Waveform Scrubber: Hovering Hour 03:00 updates telemetry inspector', 'FAIL', `Label=${hoverLabel3}`);
      }

      // Test mouseleave restores default text by moving mouse physically outside the SVG bounding box
      const svgBox = await page.locator('.waveform-chart-svg').boundingBox();
      if (svgBox) {
        await page.mouse.move(svgBox.x + svgBox.width / 2, svgBox.y + svgBox.height / 2);
        await page.waitForTimeout(100);
        // Move completely outside SVG
        await page.mouse.move(svgBox.x - 50, svgBox.y - 50);
        await page.waitForTimeout(200);
      }
      const leaveLabel = await page.textContent('.glass-box:has(.waveform-container) .box-title > span');
      if (leaveLabel && leaveLabel.includes('Hover over hours to inspect telemetry')) {
        record('Waveform Scrubber: Mouseleave restores default guidance text', 'PASS');
      } else {
        record('Waveform Scrubber: Mouseleave restores default guidance text', 'FAIL', `Got "${leaveLabel}"`);
      }
    }

    console.log('\n--- Phase 6: Testing Radial Gauge & Topology Telemetry ---');
    const gaugeBigNum = await page.textContent('.gauge-big-num');
    const parsedGauge = parseFloat(gaugeBigNum);
    if (!isNaN(parsedGauge) && parsedGauge >= 0 && parsedGauge <= 45.0) {
      record(`Radial Gauge Value Valid (${gaugeBigNum}) Clamped to Physical Limit (<=45%)`, 'PASS');
    } else {
      record('Radial Gauge Value Valid', 'FAIL', `Unexpected gauge value: ${gaugeBigNum}`);
    }

    const topologySvg = await page.$('.topology-svg-wrap svg');
    if (topologySvg) {
      record('Real-Time Power Flow Topology SVG Rendered', 'PASS');
    } else {
      record('Real-Time Power Flow Topology SVG Rendered', 'FAIL', 'Topology SVG missing');
    }

    // Check for runtime errors
    console.log('\n--- Phase 7: Runtime Stability & Console Errors ---');
    if (consoleErrors.length === 0) {
      record('Zero Console Errors / React Exceptions during entire interaction session', 'PASS');
    } else {
      record('Zero Console Errors / React Exceptions during entire interaction session', 'FAIL', 
        `Errors: ${JSON.stringify(consoleErrors)}`);
    }

    await browser.close();
  } catch (err) {
    record('Browser Automation Execution Exception', 'FAIL', err.stack || err.message);
    if (browser) await browser.close();
  }

  console.log('\n========================================================');
  console.log(`  EMPIRICAL STRESS RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('========================================================\n');

  return { passedCount, failedCount, results };
}

runCopilotUiStressTests()
  .then((res) => {
    process.exit(res.failedCount > 0 ? 1 : 0);
  })
  .catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  });
