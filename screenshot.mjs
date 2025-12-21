import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 登录
  await page.fill('input[type="email"]', 'admin@company.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(1500);

  // 进入诊断页面
  const cmdBtn = await page.$('button:has-text("Command Center")');
  if (cmdBtn) {
    await cmdBtn.click();
    await page.waitForTimeout(1000);
  }

  // 等待拓扑图渲染和动画
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'screenshot.png', fullPage: false });
  console.log('Screenshot saved to screenshot.png');

  await browser.close();
})();
