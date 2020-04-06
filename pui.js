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
        const newCase = 'body > div.banner-section.spad > div > div > div:nth-child(1) > div.bgsmall.noselect > div > div:nth-child(3) > table > tbody > tr:nth-child(3) > td:nth-child(2)';
        await page.waitForSelector(totalTests, options);

        const elementUpdatedDate = await page.$(updatedDate);
        const resultUpdatedDate = await page.evaluate(element => element.textContent, elementUpdatedDate);


        const elementTotalTests = await page.$(totalTests);
        const resultTotalTests = await page.evaluate(element => element.textContent, elementTotalTests);

        const elementNewCase = await page.$(newCase);
        const resultNewCase = await page.evaluate(element => element.textContent, elementNewCase);
        
        const elementDailyTests = await page.$(dailyTests);
        const resultDailyTests = await page.evaluate(element => element.textContent, elementDailyTests);
        
        console.log(`Updated date : ${resultUpdatedDate}`);
        console.log(`Total tests : ${resultTotalTests}`);
        console.log(`Daily tests : ${resultDailyTests}`);
        console.log(`New case : ${resultNewCase}`);

        // Insert in to Airtable
        const apiKey = process.env.API_KEY;
        var Airtable = require('airtable');
        var base = new Airtable({apiKey: apiKey}).base('appTmxT7I3Kh61mYq');
        
        // Check existed
        base('pui').select({
            filterByFormula: "DATETIME_FORMAT({Date}, 'DD-MM-YYYY') = DATETIME_FORMAT(TODAY(), 'DD-MM-YYYY')",
        }).eachPage(function page(records, fetchNextPage) {
            console.table(records.length)
            let _id = '';
            records.forEach(function (record) {
              _id = record.id
            });
            if(records.length == 0) {
              base('pui').create([
                {
                  "fields": {
                    "Date": resultUpdatedDate,
                    "Total": parseInt(resultTotalTests.replace(/,/g, ''), 10),
                    "Daily": parseInt(resultDailyTests.replace(/,/g, ''), 10),
                    "NewCase": parseInt(resultNewCase.replace(/,/g, ''), 10),
                  }
                }
              ], function(err, records) {
                if (err) {
                  console.error(err);
                  return;
                }
                records.forEach(function (record) {
                  console.log(`Created : ${record.getId()}`);
                });
              }); 
            } else {
              base('pui').update([
                {
                  "id": _id,
                  "fields": {
                    "Date": resultUpdatedDate,
                    "Total": parseInt(resultTotalTests.replace(/,/g, ''), 10) + 100,
                    "Daily": parseInt(resultDailyTests.replace(/,/g, ''), 10),
                    "NewCase": parseInt(resultNewCase.replace(/,/g, ''), 10),
                  }
                }
              ], function(err, records) {
                if (err) {
                  console.error(err);
                  return;
                }
                records.forEach(function (record) {
                  console.log(`Updated : ${record.getId()}`);
                });
              }); 
            }
        });
        
    } catch(e) {
        console.log(`${e}`);
    }



    await browser.close();
})();