const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs')

const categoryData = []

const categoryList = [{
  id: 1,
  name: '科技'
}, {
  id: 34,
  name: '不可归类'
}, {
  id: 21,
  name: '文化'
}, {
  id: 25,
  name: '建筑'
}, {
  id: 31,
  name: '记录'
}, {
  id: 30,
  name: '博物'
}, {
  id: 27,
  name: '电影'
}, {
  id: 28,
  name: '创业'
}, {
  id: 22,
  name: '艺术'
}, {
  id: 32,
  name: '历史'
}, {
  id: 33,
  name: '设计'
}, {
  id: 26,
  name: '环境'
}, {
  id: 24,
  name: '音乐'
}, {
  id: 29,
  name: '人生'
}, {
  id: 39,
  name: '生活'
}, {
  id: 20,
  name: '运动'
}, {
  id: 23,
  name: '社会'
}]

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchCategoryDetail = async (id, _page) => {
  const res = await axios.get(`https://yixi.tv/speech?page=${_page}&category_id=${id}&order_field=&active_by_rise=`)
  return Promise.resolve(res.data)
}

const fetchVideo = async (url) => {
  try {
    const res = await axios.get(url)
    const $ = cheerio.load(res.data)
    const videoPlayURL = $('source').attr('src')
    return videoPlayURL
  } catch (error) {
    return null
  }
}

const processCategoryDetail = (id, html) => {
  html = '<div id="list">' + html + '</div>'
  const $ = cheerio.load(html)
  const videos = []

  $('#list').find('.swiper-type1_item').each(async function (index, element) {
    // HTML 中含有重复的 class 名称，在此判断是否遍历内层数据。
    if (!element.parent.attribs.id) {
      return
    }

    // 获取封面图
    let coverSrc = $(this).find('img').attr('src')
    if (coverSrc) {
      coverSrc = coverSrc.split('?')[0]
    }

    let title = $(this).find('h4').eq(0).find('a').text()
    if (title) {
      // 去除两端空格
      title = title.replace(/(^\s*)|(\s*$)/g, '')
    }

    let originURL = $(this).find('a').eq(0).attr('href')
    if (originURL) {
      originURL = 'https://yixi.tv' + originURL
    }

    let author = $(this).find('.product').text()

    let intro = $(this).find('.intro').text()
    if (intro) {
      intro = intro.trim()
    }

    const playURL = await fetchVideo(originURL)

    const video = {
      resourceId: id,
      resourceOriginURL: originURL,
      resourceTitle: title,
      resourceDescription: intro,
      resourceAuthor: author,
      resourceCover: coverSrc,
      resourcePlayURL: playURL,
    }

    videos.push(video)
  })

  categoryData.push({
    id,
    data: videos
  })
}

const fetchCategory = async id => {
  let _page = 1
  let _has_next = 1

  while (_has_next === 1) {
    console.log(`>>>>>>>> Page ${_page}`)
    const {
      has_next,
      html
    } = await fetchCategoryDetail(id, _page)

    console.log(`>>>>>>>> 存在下一页： ${has_next ? '是' : '否'}`)

    _page++
    _has_next = has_next

    processCategoryDetail(id, html)

    await sleep(3000)
  }

  return Promise.resolve()
}

const run = async () => {
  for (let category of categoryList) {
    console.log(`获取 ${category.id}-${category.name} 开始`)
    await fetchCategory(category.id)

    await sleep(3000)
    console.log(`获取 ${category.id}-${category.name} 结束`)
  }

  fs.writeFileSync(__dirname + '/data.json', JSON.stringify(categoryData), 'utf-8')
}

run()