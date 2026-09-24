import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('.');

test('Side Navigation Docks (Dual Left & Right Home/Back Controls) - EB & RB', async (t) => {
  const caNhanHtml = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'index.html'), 'utf8');
  const doanhNghiepHtml = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'index.html'), 'utf8');
  const caNhanCss = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'css', 'style.css'), 'utf8');
  const doanhNghiepCss = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'css', 'style.css'), 'utf8');
  const caNhanJs = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'js', 'app.js'), 'utf8');
  const doanhNghiepJs = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'js', 'app.js'), 'utf8');

  await t.test('1. DOM Markup: both ca-nhan and doanh-nghiep must contain #navDockLeft and #navDockRight', () => {
    // ca-nhan
    assert.ok(caNhanHtml.includes('id="navDockLeft"'), 'ca-nhan missing #navDockLeft');
    assert.ok(caNhanHtml.includes('id="navDockRight"'), 'ca-nhan missing #navDockRight');
    assert.ok(caNhanHtml.includes('class="nav-dock-side nav-dock-left"'), 'ca-nhan missing left dock class');
    assert.ok(caNhanHtml.includes('class="nav-dock-side nav-dock-right"'), 'ca-nhan missing right dock class');

    // doanh-nghiep
    assert.ok(doanhNghiepHtml.includes('id="navDockLeft"'), 'doanh-nghiep missing #navDockLeft');
    assert.ok(doanhNghiepHtml.includes('id="navDockRight"'), 'doanh-nghiep missing #navDockRight');
    assert.ok(doanhNghiepHtml.includes('class="nav-dock-side nav-dock-left"'), 'doanh-nghiep missing left dock class');
    assert.ok(doanhNghiepHtml.includes('class="nav-dock-side nav-dock-right"'), 'doanh-nghiep missing right dock class');
  });

  await t.test('2. Button Composition: each dock must contain Home (top) and Back (bottom) buttons with flat SVG icons', () => {
    for (const [name, html] of [['ca-nhan', caNhanHtml], ['doanh-nghiep', doanhNghiepHtml]]) {
      // Must contain buttons with data-nav attributes
      const homeMatches = html.match(/data-nav=["']home["']/g);
      const backMatches = html.match(/data-nav=["']back["']/g);
      assert.ok(homeMatches && homeMatches.length >= 2, `${name} must have at least 2 home buttons (left & right)`);
      assert.ok(backMatches && backMatches.length >= 2, `${name} must have at least 2 back buttons (left & right)`);

      // SVG icons present inside buttons
      assert.ok(html.includes('class="nav-icon"'), `${name} must use .nav-icon class for vector graphics`);
      assert.ok(html.includes('viewBox="0 0 24 24"'), `${name} icons must have standard 24x24 viewBox`);
    }
  });

  await t.test('3. CSS Architecture: vertically centered positioning (top: 50%, translateY(-50%)), glassmorphism transparency and lower z-index', () => {
    for (const [name, css] of [['ca-nhan', caNhanCss], ['doanh-nghiep', doanhNghiepCss]]) {
      const dockMatch = css.match(/(?:^|\n)\.nav-dock-side\s*\{([^}]+)\}/);
      assert.ok(dockMatch, `${name} CSS missing .nav-dock-side block`);
      const dockContent = dockMatch[1];
      assert.match(dockContent, /top:\s*50%/, `${name} .nav-dock-side must have top: 50%`);
      assert.match(dockContent, /transform:[^;]*translateY\(-50%\)/, `${name} .nav-dock-side must have translateY(-50%)`);
      assert.match(dockContent, /bottom:\s*auto/, `${name} .nav-dock-side must reset bottom to auto`);
      assert.ok(dockContent.includes('z-index: 25'), `${name} CSS must have moderate z-index: 25 (lower than modals/popups)`);
      assert.ok(css.includes('backdrop-filter: blur(10px)'), `${name} CSS must have glassmorphism blur`);
      assert.ok(css.includes('.nav-dock-left'), `${name} CSS missing .nav-dock-left position`);
      assert.ok(css.includes('.nav-dock-right'), `${name} CSS missing .nav-dock-right position`);
    }
  });

  await t.test('4. Circular Button & Kiosk Touch Ergonomics: round shape, touch expansion, active feedback', () => {
    for (const [name, css] of [['ca-nhan', caNhanCss], ['doanh-nghiep', doanhNghiepCss]]) {
      assert.ok(css.includes('.nav-btn'), `${name} CSS missing .nav-btn`);
      assert.ok(css.includes('border-radius: 50%'), `${name} buttons must be circular (border-radius: 50%)`);
      assert.ok(css.includes('.nav-btn::before'), `${name} must use ::before pseudo-element to extend touch target`);
      assert.ok(css.includes('.nav-btn:active'), `${name} must have active feedback animation`);
    }
  });

  await t.test('5. JS Controller Logic: automated visibility update and click handlers for dual docks', () => {
    for (const [name, js] of [['ca-nhan', caNhanJs], ['doanh-nghiep', doanhNghiepJs]]) {
      assert.ok(js.includes('updateNavigationDocks()'), `${name} JS must define updateNavigationDocks()`);
      assert.ok(js.includes('nav-dock-side'), `${name} JS must target .nav-dock-side elements`);
      assert.ok(js.includes('data-nav="home"'), `${name} JS must attach event listeners to data-nav="home"`);
      assert.ok(js.includes('data-nav="back"'), `${name} JS must attach event listeners to data-nav="back"`);
      assert.ok(js.includes('handleHomeAction()'), `${name} JS must trigger handleHomeAction() on home click`);
      assert.ok(js.includes('handleBackAction()'), `${name} JS must trigger handleBackAction() on back click`);
    }
  });
});
