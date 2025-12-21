import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false }); // 使用有界面模式方便调试
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 登录
  await page.fill('input[type="email"]', 'admin@company.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  await page.waitForTimeout(2000);

  // 进入诊断页面
  const cmdBtn = await page.$('button:has-text("Command Center")');
  if (cmdBtn) {
    await cmdBtn.click();
    await page.waitForTimeout(1000);
  }

  // 等待拓扑图渲染
  await page.waitForTimeout(2000);

  console.log('测试链接功能...');
  console.log('请手动点击节点上的圆点来测试链接功能');
  console.log('按 Ctrl+C 退出');

  // 保持浏览器打开
  await page.waitForTimeout(300000); // 等待5分钟

  await browser.close();
})();
