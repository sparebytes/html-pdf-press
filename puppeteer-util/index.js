module.exports.tryMeasureAndExtractHtmlAndRemove = async (page, selector, withOverflow, includeMargins) => {
  if (includeMargins == null) {
    withOverflow = true;
  }
  if (includeMargins == null) {
    includeMargins = true;
  }
  let result = null;
  if (selector) {
    try {
      result = await page.$eval(
        selector,
        (el, withOverflow, includeMargins) => {
          const html = el.outerHTML;
          const pagePlaceholders = Array.of(el.querySelector(".pageNumber,.totalPages"));
          for (const pagePlaceholder of pagePlaceholders) {
            if (pagePlaceholder != null) {
              pagePlaceholder.innerText = "999";
            }
          }
          if (withOverflow) {
            el.style.overflow = "hidden";
          }
          // [ ] TODO: Make sure margins are correctly parsed. EG 15px vs something else
          const margins = 0 // !includeMargins ? 0 : (parseInt(elStyle["margin-top"]) || 0) + (parseInt(elStyle["margin-bottom"]) || 0);
          const elStyle = getComputedStyle(el);
          const height = el.getBoundingClientRect().height + margins;

          for (const pagePlaceholder of pagePlaceholders) {
            if (pagePlaceholder != null) {
              pagePlaceholder.innerText = "";
            }
          }
          el.remove();
          return { html, height };
        },
        withOverflow,
        includeMargins,
      );
    } catch (e) {
      console.log(e);
      // Do Nothing
    }
  }
  return result;
};

module.exports.measureHeight = async (page, html) => {
  let result = null;
  if (html) {
    try {
      result = await page.evaluate(html => {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);
        const height = wrapper.offsetHeight;
        document.body.removeChild(wrapper);
        return height;
      }, html);
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
