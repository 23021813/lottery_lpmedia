import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

  await t.test('ca-nhan/index.html should have full-screen video player and flat touch controls', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'index.html'), 'utf8');

    // Modal và video element
    assert.ok(html.includes('id="screenDemoVideo"'), 'Missing #screenDemoVideo modal in ca-nhan');
    assert.ok(html.includes('id="presentationVideo"'), 'Missing #presentationVideo in ca-nhan');
    assert.ok(html.includes('playsinline'), 'Video must have playsinline attribute');

    // Controls container
    assert.ok(html.includes('id="videoTouchControls"'), 'Missing #videoTouchControls in ca-nhan');

    // User constraint: KHÔNG CẦN TIÊU ĐỀ
    assert.ok(!html.includes('video-title-badge') && !html.includes('videoTitleBadge'), 'Controls must NOT contain title badge');

    // Controls elements: Play/Pause phẳng, Scrub bar, Volume slider, Back button
    assert.ok(html.includes('id="btnPlayToggle"'), 'Missing #btnPlayToggle in ca-nhan');
    assert.ok(html.includes('class="icon-play"'), 'Missing icon-play SVG in ca-nhan');
    assert.ok(html.includes('class="icon-pause"'), 'Missing icon-pause SVG in ca-nhan');

    assert.ok(html.includes('id="videoScrubBar"'), 'Missing #videoScrubBar in ca-nhan');
    assert.ok(html.includes('id="videoScrubProgress"'), 'Missing #videoScrubProgress in ca-nhan');
    assert.ok(html.includes('id="videoScrubThumb"'), 'Missing #videoScrubThumb in ca-nhan');

    assert.ok(html.includes('id="volumeGroup"'), 'Missing #volumeGroup in ca-nhan');
    assert.ok(html.includes('id="volumeTrackWrapper"'), 'Missing #volumeTrackWrapper in ca-nhan');
    assert.ok(html.includes('id="volumeFill"'), 'Missing #volumeFill in ca-nhan');
    assert.ok(html.includes('id="volumeThumb"'), 'Missing #volumeThumb in ca-nhan');

    assert.ok(html.includes('id="btnVideoBack"'), 'Missing #btnVideoBack in ca-nhan');
    assert.ok(html.includes('icon-back2.png'), 'Back button must use authentic icon-back2.png image style');

    // 6 screens in ca-nhan must have data-video pointing to their files
    assert.ok(html.includes('data-video="video/security.webm"'), 'Missing data-video for security.webm');
    assert.ok(html.includes('data-video="video/thay-doi-giao-dien.webm"'), 'Missing data-video for thay-doi-giao-dien.webm');
    assert.ok(html.includes('data-video="video/m-sinh-loi.webm"'), 'Missing data-video for m-sinh-loi.webm');
    assert.ok(html.includes('data-video="video/m-triple.webm"'), 'Missing data-video for m-triple.webm');
    assert.ok(html.includes('data-video="video/m-rewards.webm"'), 'Missing data-video for m-rewards.webm');
    assert.ok(html.includes('data-video="video/marketplace.webm"'), 'Missing data-video for marketplace.webm');
  });

  await t.test('doanh-nghiep/index.html should have full-screen video player and flat touch controls', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'index.html'), 'utf8');

    // Modal và video element
    assert.ok(html.includes('id="screenDemoVideo"'), 'Missing #screenDemoVideo modal in doanh-nghiep');
    assert.ok(html.includes('id="presentationVideo"'), 'Missing #presentationVideo in doanh-nghiep');
    assert.ok(html.includes('playsinline'), 'Video must have playsinline attribute');

    // Controls container
    assert.ok(html.includes('id="videoTouchControls"'), 'Missing #videoTouchControls in doanh-nghiep');

    // User constraint: KHÔNG CẦN TIÊU ĐỀ
    assert.ok(!html.includes('video-title-badge') && !html.includes('videoTitleBadge'), 'Controls must NOT contain title badge');

    // Controls elements: Play/Pause phẳng, Scrub bar, Volume slider, Back button
    assert.ok(html.includes('id="btnPlayToggle"'), 'Missing #btnPlayToggle in doanh-nghiep');
    assert.ok(html.includes('class="icon-play"'), 'Missing icon-play SVG in doanh-nghiep');
    assert.ok(html.includes('class="icon-pause"'), 'Missing icon-pause SVG in doanh-nghiep');

    assert.ok(html.includes('id="videoScrubBar"'), 'Missing #videoScrubBar in doanh-nghiep');
    assert.ok(html.includes('id="videoScrubProgress"'), 'Missing #videoScrubProgress in doanh-nghiep');
    assert.ok(html.includes('id="videoScrubThumb"'), 'Missing #videoScrubThumb in doanh-nghiep');

    assert.ok(html.includes('id="volumeGroup"'), 'Missing #volumeGroup in doanh-nghiep');
    assert.ok(html.includes('id="volumeTrackWrapper"'), 'Missing #volumeTrackWrapper in doanh-nghiep');
    assert.ok(html.includes('id="volumeFill"'), 'Missing #volumeFill in doanh-nghiep');
    assert.ok(html.includes('id="volumeThumb"'), 'Missing #volumeThumb in doanh-nghiep');

    assert.ok(html.includes('id="btnVideoBack"'), 'Missing #btnVideoBack in doanh-nghiep');
    assert.ok(html.includes('icon-back2.png'), 'Back button must use authentic icon-back2.png image style');

    // 7 screens in doanh-nghiep must have data-demo-video pointing to their files
    assert.ok(html.includes('data-demo-video="video/quan-tri-dich-vu.webm"'), 'Missing data-demo-video for quan-tri-dich-vu.webm');
    assert.ok(html.includes('data-demo-video="video/ket-noi-doi-tac.webm"'), 'Missing data-demo-video for ket-noi-doi-tac.webm');
    assert.ok(html.includes('data-demo-video="video/tin-dung-linh-hoat.webm"'), 'Missing data-demo-video for tin-dung-linh-hoat.webm');
    assert.ok(html.includes('data-demo-video="video/tai-cap-han-muc.webm"'), 'Missing data-demo-video for tai-cap-han-muc.webm');
    assert.ok(html.includes('data-demo-video="video/the-tin-dung.webm"'), 'Missing data-demo-video for the-tin-dung.webm');
    assert.ok(html.includes('data-demo-video="video/chung-chi-tien-gui.webm"'), 'Missing data-demo-video for chung-chi-tien-gui.webm');
    assert.ok(html.includes('data-demo-video="video/msb-rewards.webm"'), 'Missing data-demo-video for msb-rewards.webm');
  });

  await t.test('CSS styles in both applications must include video modal and flat touch controls', () => {
    const cssCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'css', 'style.css'), 'utf8');
    const cssDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'css', 'style.css'), 'utf8');

    [cssCN, cssDN].forEach((css, idx) => {
      const appName = idx === 0 ? 'ca-nhan' : 'doanh-nghiep';
      assert.ok(css.includes('.demo-video-modal'), `${appName} missing .demo-video-modal`);
      assert.ok(css.includes('.presentation-video'), `${appName} missing .presentation-video`);
      assert.ok(css.includes('.video-touch-controls'), `${appName} missing .video-touch-controls`);
      assert.ok(css.includes('.video-touch-controls.is-dimmed'), `${appName} missing .video-touch-controls.is-dimmed for auto-hide`);
      assert.ok(css.includes('.video-scrub-bar'), `${appName} missing .video-scrub-bar`);
      assert.ok(css.includes('.volume-slider-group'), `${appName} missing .volume-slider-group`);
      assert.ok(css.includes('.volume-track-wrapper'), `${appName} missing .volume-track-wrapper`);
      assert.ok(css.includes('.btn-ctrl-back'), `${appName} missing .btn-ctrl-back`);
    });
  });

  await t.test('JS controllers in both applications must include video mapping and auto-dim logic', () => {
    const jsCN = fs.readFileSync(path.join(ROOT_DIR, 'ca-nhan', 'js', 'app.js'), 'utf8');
    const jsDN = fs.readFileSync(path.join(ROOT_DIR, 'doanh-nghiep', 'js', 'app.js'), 'utf8');

    // ca-nhan
    assert.ok(jsCN.includes('screenVideoMap'), 'ca-nhan/js/app.js missing screenVideoMap');
    assert.ok(jsCN.includes('setupVideoControls'), 'ca-nhan/js/app.js missing setupVideoControls');
    assert.ok(jsCN.includes('resetControlsAutoDim'), 'ca-nhan/js/app.js missing resetControlsAutoDim');
    assert.ok(jsCN.includes('setPointerCapture'), 'ca-nhan/js/app.js must use setPointerCapture for touch scrub/volume');

    // doanh-nghiep
    assert.ok(jsDN.includes('screenVideoMap'), 'doanh-nghiep/js/app.js missing screenVideoMap');
    assert.ok(jsDN.includes('setupVideoControls'), 'doanh-nghiep/js/app.js missing setupVideoControls');
    assert.ok(jsDN.includes('resetControlsAutoDim'), 'doanh-nghiep/js/app.js missing resetControlsAutoDim');
    assert.ok(jsDN.includes('setPointerCapture'), 'doanh-nghiep/js/app.js must use setPointerCapture for touch scrub/volume');
  });
});
