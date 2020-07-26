//設定資料庫連線
const mongoose = require('mongoose')
const Restaurant = require('../restaurant')
const restaurantList = require('../../restaurant.json')

mongoose.connect('mongodb://localhost/restaurant-list', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.on('error', () => {
  console.log('mongodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
  //新增json檔內的資料
  restaurantList.results.forEach((restaurant) => {
    //mongoose 提供的資料操作方法，建立一個叫 Restaurant 的 model 物件，可使用這些方法
    //產生資料時，需告知規格，這裡按照了之前在 schema 中定義的規格
    Restaurant.create({
      name: restaurant.name,
      name_en: restaurant.name_en,
      category: restaurant.category,
      image: restaurant.image,
      location: restaurant.location,
      phone: restaurant.phone,
      google_map: restaurant.google_map,
      rating: restaurant.rating,
      description: restaurant.description,
    })
  })

  console.log('done!')
})
