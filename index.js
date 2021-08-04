const axios = require('axios')
const cheerio = require('cheerio');
const uuid = require('uuid');
const fs = require('fs')


// Change the scrap configurations here
const YEAR_START = 1960
const YEAR_END = 2021
const LANGUAGE = 'nl'

const BASE_URL = 'https://www.podnapisi.net'
const getUrl = (year, page) =>
  `${BASE_URL}/en/subtitles/search/?sort=stats.downloads&fps=!23.976&year=${year}&movie_type=movie&language=!${LANGUAGE}&order=desc&page=${page}`

const pause = (ms) =>
  new Promise((resolve) => { setTimeout(() => { resolve() }, ms)})


const LINKS_TO_DOWNLOAD = []

const addLinksToDownload = async(url, retryCount = 5) => {
  try{ 
    const { data } = await axios({
      method: 'GET',
      url: url,
      headers: {
        'User-Agent': `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0`,
        'Accept': `text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8`
      }
    })

    const $ = cheerio.load(data);
    const movies = $('table tbody tr')
    if(movies.length < 1) {
      console.log('no movies found')
      return true;
    }

    const links = movies.map((i, e) => {
      return $(e).find('a[alt="Download subtitles."]').prop('href')
    }).get()

    if(links.length < 1) {
      console.log('no links found')
      return true;
    }

    LINKS_TO_DOWNLOAD.push(...links)
  }catch(e){
    console.log(`retrying download movie ${url}`)
    await pause(5000)
    return addLinksToDownload(url)
  }  
}

const start = async () => {
  for(let year = YEAR_START; year <= YEAR_END; year++){
    for(let pagination = 1; pagination <= 15; pagination++) {
      process.stdout.write(`Downloading Year: ${year} Page: ${pagination}\r`);

      const url = getUrl(`${year}-${year}`, pagination)
      const hasNoMoreMovies = await addLinksToDownload(url)

      await pause(5000)

      if(hasNoMoreMovies) break;

      
    }
  }
}

(() => {
  start() 
})();

// dowload files
const downloadFile = async(link) => {
  try{ 
    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}${link}`,
      responseType: 'stream'
    })
  
    response.data.pipe(fs.createWriteStream(`./files/${uuid.v4()}.zip`))
    response.data.on('error', () => {
      console.log('GARAI')
    })

    return
  } catch(e) {
    return link
  }
  
}
setInterval(async() => {
  if(LINKS_TO_DOWNLOAD.length < 1) return

  process.stdout.write(`Downloading file.. total: ${LINKS_TO_DOWNLOAD.length}\r`);

  const link = LINKS_TO_DOWNLOAD.pop()
  
  const retryLink = await downloadFile(link)
  if(retryLink) {
    LINKS_TO_DOWNLOAD.push(retryLink)
  }

}, 1000)