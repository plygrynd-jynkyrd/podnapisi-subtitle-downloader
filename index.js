const puppeteer = require('puppeteer');

// Change the scrap configurations here
const YEAR_START = 1960
const YEAR_END = 2021
const LANGUAGE = 'nl'


const BASE_URL = 'https://www.podnapisi.net/en/subtitles/search/?sort=stats.downloads&fps=!23.976'
const getUrl = (year, page) =>
  `${BASE_URL}&year=${year}&movie_type=movie&language=!${LANGUAGE}&order=desc&page=${page}`

const pause = (ms) =>
  new Promise((resolve) => { setTimeout(() => { resolve() }, ms)})

const download = async (browser, href) => {
  const page = await browser.newPage();
  try{
    await page.goto(href);
  } catch {}
  setTimeout(() => {
    page.close()
  }, 3000)
}

const start = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for(let year = YEAR_START; year <= YEAR_END; year++){
    for(let pagination = 1; pagination <= 15; pagination++) {
      const url = getUrl(`${year}-${year}`, pagination)

      console.log(`Downloading Year: ${year} Page: ${pagination}`)

      await page.goto(url);
      await page.waitForSelector('footer');

      const hrefs = await page.$$eval('a[alt="Download subtitles."', as => as.map(a => a.href));

      for(let i = 0; i < hrefs.length; i++) {
        download(browser, hrefs[i])
        await pause(1000)
      }

      await pause(5000)
    }
  }

  await browser.close();
}

(() => {
  start() 
})();