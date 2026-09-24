import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT_DIR = process.cwd();

test('Video Assets & Full-Screen Touch Presentation Test Suite', async (t) => {

  await t.test('All 13 WebM videos must exist and be non-empty', () => {
    const caNhanVideos = [
      'security.webm',
      'thay-doi-giao-dien.webm',
      'm-sinh-loi.webm',
      'm-triple.webm',
      'm-rewards.webm',
      'marketplace.webm'
    ];

    const doanhNghiepVideos = [
      'quan-tri-dich-vu.webm',
      'ket-noi-doi-tac.webm',
      'tin-dung-linh-hoat.webm',
      'tai-cap-han-muc.webm',
      'the-tin-dung.webm',
      'chung-chi-tien-gui.webm',
      'msb-rewards.webm'
    ];

    caNhanVideos.forEach(file => {
      const p = path.join(ROOT_DIR, 'ca-nhan', 'video', file);
      assert.ok(fs.existsSync(p), `Missing ca-nhan video: ${file}`);
      const stats = fs.statSync(p);
      assert.ok(stats.size > 100000, `Video file ${file} is too small (${stats.size} bytes)`);
    });

    doanhNghiepVideos.forEach(file => {
      const p = path.join(ROOT_DIR, 'doanh-nghiep', 'video', file);
      assert.ok(fs.existsSync(p), `Missing doanh-nghiep video: ${file}`);
      const stats = fs.statSync(p);
      assert.ok(stats.size > 100000, `Video file ${file} is too small (${stats.size} bytes)`);
    });
  });

  await t.test('ca-nhan/index.html should have full-screen video player with minimal controls', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'index.html'), 'utf8');

    // Modal và video element
    assert.ok(html.includes('id="screenDemoVideo"'), 'Missing #screenDemoVideo modal in ca-nhan');
    assert.ok(html.includes('id="presentationVideo"'), 'Missing #presentationVideo in ca-nhan');
    assert.ok(html.includes('playsinline'), 'Video must have playsinline attribute');

    // Controls container
    assert.ok(html.includes('id="videoTouchControls"'), 'Missing #videoTouchControls in ca-nhan');

    // User constraints: KHÔNG CẦN TIÊU ĐỀ, BỎ ÂM THANH, BỎ TIME
    assert.ok(!html.includes('video-title-badge') && !html.includes('videoTitleBadge'), 'Controls must NOT contain title badge');
    assert.ok(!html.includes('id="volumeGroup"') && !html.includes('volume-slider-group'), 'Controls must NOT contain volume slider');
    assert.ok(!html.includes('id="videoTimeDisplay"') && !html.includes('video-time-display'), 'Controls must NOT contain time display');

    // Controls elements: Play/Pause phẳng, Scrub bar, Back button
    assert.ok(html.includes('id="btnPlayToggle"'), 'Missing #btnPlayToggle in ca-nhan');
    assert.ok(html.includes('class="icon-play"'), 'Missing icon-play SVG in ca-nhan');
    assert.ok(html.includes('class="icon-pause"'), 'Missing icon-pause SVG in ca-nhan');

    assert.ok(html.includes('id="videoScrubBar"'), 'Missing #videoScrubBar in ca-nhan');
    assert.ok(html.includes('id="videoScrubProgress"'), 'Missing #videoScrubProgress in ca-nhan');
    assert.ok(html.includes('id="videoScrubThumb"'), 'Missing #videoScrubThumb in ca-nhan');

    assert.ok(html.includes('id="btnVideoBack"'), 'Missing #btnVideoBack in ca-nhan');
    assert.ok(html.includes('id="btnVideoHome"'), 'Missing #btnVideoHome in ca-nhan');
    assert.ok(html.includes('btn-round-action'), 'Video controls must have round action buttons');
    assert.ok(html.includes('id="navDockLeft"') && html.includes('id="navDockRight"'), 'Missing side navigation docks in ca-nhan');
    assert.ok(html.includes('data-nav="home"'), 'Missing data-nav="home" button in ca-nhan');
    assert.ok(html.includes('data-nav="back"'), 'Missing data-nav="back" button in ca-nhan');

    // 6 screens in ca-nhan must have data-video pointing to their files
    assert.ok(html.includes('security.webm'), 'Missing data-video for security.webm');
    assert.ok(html.includes('thay-doi-giao-dien.webm'), 'Missing data-video for thay-doi-giao-dien.webm');
    assert.ok(html.includes('m-sinh-loi.webm'), 'Missing data-video for m-sinh-loi.webm');
    assert.ok(html.includes('m-triple.webm'), 'Missing data-video for m-triple.webm');
    assert.ok(html.includes('m-rewards.webm'), 'Missing data-video for m-rewards.webm');
    assert.ok(html.includes('marketplace.webm'), 'Missing data-video for marketplace.webm');
    assert.ok(html.includes('media-ca-nhan'), 'Must point to media-ca-nhan release');
  });

  await t.test('doanh-nghiep/index.html should have full-screen video player with minimal controls', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'index.html'), 'utf8');

    // Modal và video element
    assert.ok(html.includes('id="screenDemoVideo"'), 'Missing #screenDemoVideo modal in doanh-nghiep');
    assert.ok(html.includes('id="presentationVideo"'), 'Missing #presentationVideo in doanh-nghiep');
    assert.ok(html.includes('playsinline'), 'Video must have playsinline attribute');

    // Controls container
    assert.ok(html.includes('id="videoTouchControls"'), 'Missing #videoTouchControls in doanh-nghiep');

    // User constraints: KHÔNG CẦN TIÊU ĐỀ, BỎ ÂM THANH, BỎ TIME
    assert.ok(!html.includes('video-title-badge') && !html.includes('videoTitleBadge'), 'Controls must NOT contain title badge');
    assert.ok(!html.includes('id="volumeGroup"') && !html.includes('volume-slider-group'), 'Controls must NOT contain volume slider');
    assert.ok(!html.includes('id="videoTimeDisplay"') && !html.includes('video-time-display'), 'Controls must NOT contain time display');

    // Controls elements: Play/Pause phẳng, Scrub bar, Back button
    assert.ok(html.includes('id="btnPlayToggle"'), 'Missing #btnPlayToggle in doanh-nghiep');
    assert.ok(html.includes('class="icon-play"'), 'Missing icon-play SVG in doanh-nghiep');
    assert.ok(html.includes('class="icon-pause"'), 'Missing icon-pause SVG in doanh-nghiep');

    assert.ok(html.includes('id="videoScrubBar"'), 'Missing #videoScrubBar in doanh-nghiep');
    assert.ok(html.includes('id="videoScrubProgress"'), 'Missing #videoScrubProgress in doanh-nghiep');
    assert.ok(html.includes('id="videoScrubThumb"'), 'Missing #videoScrubThumb in doanh-nghiep');

    assert.ok(html.includes('id="btnVideoBack"'), 'Missing #btnVideoBack in doanh-nghiep');
    assert.ok(html.includes('id="btnVideoHome"'), 'Missing #btnVideoHome in doanh-nghiep');
    assert.ok(html.includes('btn-round-action'), 'Video controls must have round action buttons');
    assert.ok(html.includes('id="navDockLeft"') && html.includes('id="navDockRight"'), 'Missing side navigation docks in doanh-nghiep');
    assert.ok(html.includes('data-nav="home"'), 'Missing data-nav="home" button in doanh-nghiep');
    assert.ok(html.includes('data-nav="back"'), 'Missing data-nav="back" button in doanh-nghiep');

    // 7 screens in doanh-nghiep must have data-demo-video pointing to their files
    assert.ok(html.includes('quan-tri-dich-vu.webm'), 'Missing data-demo-video for quan-tri-dich-vu.webm');
    assert.ok(html.includes('ket-noi-doi-tac.webm'), 'Missing data-demo-video for ket-noi-doi-tac.webm');
    assert.ok(html.includes('tin-dung-linh-hoat.webm'), 'Missing data-demo-video for tin-dung-linh-hoat.webm');
    assert.ok(html.includes('tai-cap-han-muc.webm'), 'Missing data-demo-video for tai-cap-han-muc.webm');
    assert.ok(html.includes('the-tin-dung.webm'), 'Missing data-demo-video for the-tin-dung.webm');
    assert.ok(html.includes('chung-chi-tien-gui.webm'), 'Missing data-demo-video for chung-chi-tien-gui.webm');
    assert.ok(html.includes('msb-rewards.webm'), 'Missing data-demo-video for msb-rewards.webm');
    assert.ok(html.includes('media-doanh-nghiep'), 'Must point to media-doanh-nghiep release');
  });

  await t.test('CSS styles in both applications must configure controls hidden by default and visible on .is-visible', () => {
    const cssCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'css', 'style.css'), 'utf8');
    const cssDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'css', 'style.css'), 'utf8');

    [cssCN, cssDN].forEach((css, idx) => {
      const appName = idx === 0 ? 'ca-nhan' : 'doanh-nghiep';
      assert.ok(css.includes('.demo-video-modal'), `${appName} missing .demo-video-modal`);
      assert.ok(css.includes('.presentation-video'), `${appName} missing .presentation-video`);
      assert.ok(css.includes('.video-touch-controls'), `${appName} missing .video-touch-controls`);
      assert.ok(css.includes('.video-touch-controls.is-visible'), `${appName} missing .video-touch-controls.is-visible for touch reveal`);
      assert.ok(css.includes('.video-scrub-bar'), `${appName} missing .video-scrub-bar`);
      assert.ok(css.includes('.btn-ctrl-back'), `${appName} missing .btn-ctrl-back`);
      assert.ok(!css.includes('.volume-slider-group'), `${appName} should not include .volume-slider-group`);
    });
  });

  await t.test('JS controllers must implement Cinematic Zoom animation and 5s auto-hide touch controls', () => {
    const jsCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'js', 'app.js'), 'utf8');
    const jsDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'js', 'app.js'), 'utf8');

    // ca-nhan
    assert.ok(jsCN.includes('showControlsWithTimer'), 'ca-nhan/js/app.js missing showControlsWithTimer');
    assert.ok(jsCN.includes('hideControls'), 'ca-nhan/js/app.js missing hideControls');
    assert.ok(jsCN.includes('5000'), 'ca-nhan/js/app.js must use 5000ms timer for auto-hide');
    assert.ok(jsCN.includes('scale: 0.88') && jsCN.includes('blur(10px)'), 'ca-nhan/js/app.js must use Cinematic Zoom & Focus entrance animation');

    // doanh-nghiep
    assert.ok(jsDN.includes('showControlsWithTimer'), 'doanh-nghiep/js/app.js missing showControlsWithTimer');
    assert.ok(jsDN.includes('hideControls'), 'doanh-nghiep/js/app.js missing hideControls');
    assert.ok(jsDN.includes('5000'), 'doanh-nghiep/js/app.js must use 5000ms timer for auto-hide');
    assert.ok(jsDN.includes('scale: 0.88') && jsDN.includes('blur(10px)'), 'doanh-nghiep/js/app.js must use Cinematic Zoom & Focus entrance animation');
  });

  await t.test('Presentation background in CSS must use brand background image with transparent video', () => {
    const cssCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'css', 'style.css'), 'utf8');
    const cssDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'css', 'style.css'), 'utf8');

    // ca-nhan: bg_canhanhoa.jpg and transparent video
    assert.ok(cssCN.includes("bg_canhanhoa.jpg"), 'ca-nhan/css/style.css must use bg_canhanhoa.jpg for presentation background');
    assert.match(cssCN, /\.presentation-video\s*\{[^}]*background:\s*transparent;/s, 'ca-nhan .presentation-video must have background: transparent');

    // doanh-nghiep: bg_toiuu.jpg and transparent video
    assert.ok(cssDN.includes("bg_toiuu.jpg"), 'doanh-nghiep/css/style.css must use bg_toiuu.jpg for presentation background');
    assert.match(cssDN, /\.presentation-video\s*\{[^}]*background:\s*transparent;/s, 'doanh-nghiep .presentation-video must have background: transparent');
  });

  await t.test('All 13 WebM videos must contain alpha channel (alpha_mode = 1)', () => {
    const caNhanVideos = [
      'security.webm',
      'thay-doi-giao-dien.webm',
      'm-sinh-loi.webm',
      'm-triple.webm',
      'm-rewards.webm',
      'marketplace.webm'
    ];

    const doanhNghiepVideos = [
      'quan-tri-dich-vu.webm',
      'ket-noi-doi-tac.webm',
      'tin-dung-linh-hoat.webm',
      'tai-cap-han-muc.webm',
      'the-tin-dung.webm',
      'chung-chi-tien-gui.webm',
      'msb-rewards.webm'
    ];

    const checkAlpha = (filePath) => {
      const out = execSync(`ffprobe -v error -show_entries stream=codec_name,pix_fmt -show_entries stream_tags=alpha_mode -of json "${filePath}"`).toString();
      const data = JSON.parse(out);
      const stream = data.streams && data.streams[0];
      assert.ok(stream, `No video stream found in ${filePath}`);
      assert.strictEqual(stream.tags && stream.tags.alpha_mode, '1', `${filePath} does not have alpha_mode: 1`);
    };

    caNhanVideos.forEach(file => {
      checkAlpha(path.join(ROOT_DIR, 'ca-nhan', 'video', file));
    });

    doanhNghiepVideos.forEach(file => {
      checkAlpha(path.join(ROOT_DIR, 'doanh-nghiep', 'video', file));
    });
  });

  await t.test('Video Touch and Pointer Responsiveness Fixes', () => {
    const cssCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'css', 'style.css'), 'utf8');
    const cssDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'css', 'style.css'), 'utf8');
    const jsCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'js', 'app.js'), 'utf8');
    const jsDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'js', 'app.js'), 'utf8');

    // 1. nav-dock-side có z-index: 170 để luôn nổi trên video modal (150) và controls (160)
    assert.match(cssCN, /\.nav-dock-side\s*\{[^}]*z-index:\s*170;/s, 'ca-nhan .nav-dock-side must have z-index: 170');
    assert.match(cssDN, /\.nav-dock-side\s*\{[^}]*z-index:\s*170;/s, 'doanh-nghiep .nav-dock-side must have z-index: 170');

    // 2. presentation-video có touch-action: manipulation
    assert.ok(cssCN.includes('touch-action: manipulation;'), 'ca-nhan must define touch-action: manipulation for video');
    assert.ok(cssDN.includes('touch-action: manipulation;'), 'doanh-nghiep must define touch-action: manipulation for video');

    // 3. JS Controller: controlsWereVisibleOnPointerDown để tránh tự động pause video khi chỉ chạm hiện controls
    assert.ok(jsCN.includes('controlsWereVisibleOnPointerDown'), 'ca-nhan app.js must handle controlsWereVisibleOnPointerDown');
    assert.ok(jsDN.includes('controlsWereVisibleOnPointerDown'), 'doanh-nghiep app.js must handle controlsWereVisibleOnPointerDown');

    // 4. JS Controller: reset currentTime = 0 khi video.ended
    assert.ok(jsCN.includes('video.currentTime = 0;'), 'ca-nhan app.js must reset currentTime on ended');
    assert.ok(jsDN.includes('video.currentTime = 0;'), 'doanh-nghiep app.js must reset currentTime on ended');

    // 5. JS Controller: window pointerup giải phóng isScrubbing
    assert.ok(jsCN.includes("window.addEventListener('pointerup'"), 'ca-nhan app.js must listen for window pointerup to clear isScrubbing');
    assert.ok(jsDN.includes("window.addEventListener('pointerup'"), 'doanh-nghiep app.js must listen for window pointerup to clear isScrubbing');

    // 6. JS Controller: Failsafe pointerEvents: 'none' trong closeDemo
    assert.ok(jsCN.includes("this.dom.demoVideoModal.style.pointerEvents = 'none';"), 'ca-nhan closeDemo must apply immediate pointerEvents: none');
    assert.ok(jsDN.includes("this.dom.demoVideoModal.style.pointerEvents = 'none';"), 'doanh-nghiep closeDemo must apply immediate pointerEvents: none');
  });
});

