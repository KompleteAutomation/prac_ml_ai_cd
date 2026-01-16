const { captureSnapshot } = require('./domSnapshot');

function installLocatorInterceptor(page, testInfo) {
  const originalLocator = page.locator.bind(page);
  const original$ = page.$.bind(page);
  const original$$ = page.$$.bind(page);
  const originalWaitForSelector = page.waitForSelector.bind(page);
  const originalFill = page.fill.bind(page);

   // ---- waitForSelector interception (CRITICAL) ----
  page.waitForSelector = async (selector, options) => {
    try {
      return await originalWaitForSelector(selector, options);
    } catch (error) {
      captureSnapshot({ page, selector, error, testInfo });
      throw error;
    }
  };

  // ---- locator() interception ----
  page.locator = (selector, options) => {
    const locator = originalLocator(selector, options);

    return new Proxy(locator, {
      get(target, prop) {
        const original = target[prop];
        if (typeof original !== 'function') return original;

        return async (...args) => {
          try {
            return await original.apply(target, args);
          } catch (error) {
            captureSnapshot({ page, selector, error, testInfo });
            throw error;
          }
        };
      }
    });
  };

  // page.getByRole = (role, options) => {
  //   const locator = originalLocator().getByRole(role, options); 
  //   return new Proxy(locator, {
  //     get(target, prop) {
  //       const original = target[prop];
  //       if (typeof original !== 'function') return original;    
  //       return async (...args) => {
  //         try {
  //           return await original.apply(target, args);  
  //         } catch (error) {
  //           captureSnapshot({ page, selector: `role=${role}`, error, testInfo });
  //           throw error;
  //         } 
  //       };
  //     }
  //   });
  // };

  // ---- page.$ interception ----
  page.$ = async (selector) => {
    const el = await original$(selector);
    if (!el) {
      captureSnapshot({
        page,
        selector,
        error: new Error('Element not found using page.$'),
        testInfo
      });
    }
    return el;
  };

  page.fill = async (selector, value, options) => {
    try {
      return await originalFill(selector, value, options);
    } catch (error) {
      captureSnapshot({
        page,
        selector,
        error,
        testInfo
      });
      throw error;
    }
  };




  // ---- page.$$ interception ----
  page.$$ = async (selector) => {
    const els = await original$$(selector);
    if (!els || els.length === 0) {
      captureSnapshot({
        page,
        selector,
        error: new Error('Elements not found using page.$$'),
        testInfo
      });
    }
    return els;
  };
}

module.exports = { installLocatorInterceptor };
