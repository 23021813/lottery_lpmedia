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
      assert.ok(dockContent.includes('z-index: 170') || dockContent.includes('z-index: 25'), `${name} CSS must have appropriate z-index`);
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

  await t.test('6. Side Navigation Docks Collision Prevention: snug edge positioning, compact button size and strictly contained hit target (inset: 0)', () => {
    for (const [name, css] of [['ca-nhan', caNhanCss], ['doanh-nghiep', doanhNghiepCss]]) {
      // 1. Snug edge positioning: left and right clamp to 10px - 16px
      const leftMatch = css.match(/\.nav-dock-left\s*\{([^}]+)\}/);
      assert.ok(leftMatch, `${name} missing .nav-dock-left`);
      assert.match(leftMatch[1], /left:\s*clamp\(\s*10px,\s*1vw,\s*1[56]px\s*\)/, `${name} .nav-dock-left must be clamped close to edge (10px - 15px/16px)`);

      const rightMatch = css.match(/\.nav-dock-right\s*\{([^}]+)\}/);
      assert.ok(rightMatch, `${name} missing .nav-dock-right`);
      assert.match(rightMatch[1], /right:\s*clamp\(\s*10px,\s*1vw,\s*1[56]px\s*\)/, `${name} .nav-dock-right must be clamped close to edge (10px - 15px/16px)`);

      // 2. Compact button size: <= 40px (e.g. clamp(34px, 2.6vw, 40px))
      const btnMatch = css.match(/(?:^|\n)\.nav-btn\s*\{([^}]+)\}/);
      assert.ok(btnMatch, `${name} missing .nav-btn block`);
      assert.match(btnMatch[1], /width:\s*clamp\(\s*3[2-6]px,\s*2\.[4-8]vw,\s*4[02]px\s*\)/, `${name} .nav-btn width must be compacted`);
      assert.match(btnMatch[1], /height:\s*clamp\(\s*3[2-6]px,\s*2\.[4-8]vw,\s*4[02]px\s*\)/, `${name} .nav-btn height must be compacted`);

      // 3. Strictly contained hit target: inset must be 0 (no outer overflow)
      const beforeMatch = css.match(/\.nav-btn::before\s*\{([^}]+)\}/);
      assert.ok(beforeMatch, `${name} missing .nav-btn::before`);
      assert.match(beforeMatch[1], /inset:\s*0(?:px)?/, `${name} .nav-btn::before inset must be 0 to avoid overlapping cards`);
    }
  });
});
