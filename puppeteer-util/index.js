module.exports.tryExtractHtmlAndRemove = async (page, selector) => {
  let result = null;
  if (selector) {
    try {
      result = await page.$eval(selector, el => {
        const html = el.outerHTML;
        el.remove();
        return html;
      });
    } catch (e) {
      // Do Nothing
    }
  }
  return result;
};

module.exports.tryExtractHtmlOfMany = async (page, selector) => {
  let result = [];
  if (selector) {
    try {
      result = await page.$$eval(selector, els => {
        const html = els.map(el => el.outerHTML);
        return html;
      });
    } catch (e) {
      // Do Nothing
    }
  }
  return result;
};

module.exports.waitForImagesToLoad = async page => {
  return page.evaluate(async () => {
    const selectors = Array.from(document.querySelectorAll("img"));
    let results = await Promise.all(
      selectors.map(img => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.addEventListener("load", resolve(true));
          img.addEventListener("error", resolve(false));
        });
      }),
    );
    results = results.every(r => r);
  });
};

module.exports.waitForFontsToLoad = async page => {
  return page.evaluate(async () => {
    return document.fonts.ready;
  });
};

module.exports.blurActiveElement = async page => {
  await page.evaluate(() => {
    const focusedEl = document.activeElement;
    if (focusedEl) {
      focusedEl.blur();
    }
  });
};
