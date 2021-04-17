const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.podnapisi.net/en/subtitles/search/?sort=stats.downloads&fps=!23.976'
const year = '2005-2005'

const getUrl = (year, page) =>
  `${BASE_URL}&year=${year}&movie_type=movie&language=!en&order=desc&page=${page}`

const pause = (ms) =>
  new Promise((resolve) => { setTimeout(() => { resolve() }, ms)})

const doIt = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  for(let year = 2003; year <= 2021; year++){
    for(let pagination = 1; pagination <= 15; pagination++) {
      const url = getUrl(`${year}-${year}`, pagination)

      console.log(`Downloading Year: ${year} Page: ${pagination}`)

      await page.goto(url);
      await page.waitForSelector('footer');

      const downloadSelectors = await page.$$('a[alt="Download subtitles."')

      for(let i = 0; i < downloadSelectors.length; i++) {
        downloadSelectors[i].click()
        await pause(1000)
      }

      await pause(5000)
    }
  }

  await browser.close();
}

(() => {
  doIt() 
})();


console.log("wtf")