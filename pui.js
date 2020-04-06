'use strict';

const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch({
        timeout: 30000
    });
    const page = await browser.newPage(); 

    const options = {waitUntil: 'load', timeout: 0};
    
    try {
        await page.goto(`https://ddc.moph.go.th/viralpneumonia/eng/`);
      
        const updatedDate = 'body > div.banner-section.spad > div > div > div:nth-child(1) > div.bgsmall.noselect > div > table > tbody > tr > td:nth-child(1)';
        const totalTests = 'body > div.banner-section.spad > div > div > div:nth-child(1) > div.bgsmall.noselect > div > div:nth-child(3) > table > tbody > tr:nth-child(8) > td:nth-child(1)';
        const dailyTests = 'body > div.banner-section.spad > div > div > div:nth-child(1) > div.bgsmall.noselect > div > div:nth-child(3) > table > tbody > tr:nth-child(8) > td:nth-child(2)';
        await page.waitForSelector(totalTests, options);

        const elementUpdatedDate = await page.$(updatedDate);
        const resultUpdatedDate = await page.evaluate(element => element.textContent, elementUpdatedDate);


        const elementTotalTests = await page.$(totalTests);
        const resultTotalTests = await page.evaluate(element => element.textContent, elementTotalTests);

        const elementDailyTests = await page.$(dailyTests);
        const resultDailyTests = await page.evaluate(element => element.textContent, elementDailyTests);
        
        console.log(`Updated date : ${resultUpdatedDate}`);
        console.log(`Total tests : ${resultTotalTests}`);
        console.log(`Daily tests : ${resultDailyTests}`);

        // Insert in to Airtable
        const apiKey = process.env.API_KEY;
        var Airtable = require('airtable');
        var base = new Airtable({apiKey: apiKey}).base('appTmxT7I3Kh61mYq');
        base('pui').create([
            {
              "fields": {
                "Date": resultUpdatedDate,
                "Total": parseInt(resultTotalTests.replace(/,/g, ''), 10),
                "Daily": parseInt(resultDailyTests.replace(/,/g, ''), 10)
              }
            }
          ], function(err, records) {
            if (err) {
              console.error(err);
              return;
            }
            records.forEach(function (record) {
              console.log(`Done : ${record.getId()}`);
            });
          });
    } catch(e) {
        console.log(`${e}`);
    }



    await browser.close();
})();