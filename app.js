const express = require('express') // 載入 express
const mongoose = require('mongoose') // 載入 mongoose
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const Restaurant = require('./models/restaurant')
const restaurant = require('./models/restaurant')

// 呼叫 express 會啟動 Express 應用程式伺服器，用 app 這個變數來代表伺服器
// 此伺服器不同於資料庫伺服器
const app = express()
const port = 3000

// 設定連線到 mongoDB
// 資料庫伺服器位置  資料庫名稱
mongoose.connect('mongodb://localhost/restaurant-list', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// 取得資料庫連線狀態，把狀態參數暫存起來到 db 物件
const db = mongoose.connection
// 連線異常，用 on 註冊事件監聽
db.on('error', () => {
  console.log('mongodb error!')
})
// 連線成功，once 是一次性監聽器，執行 callback 後就解除
db.once('open', () => {
  console.log('mongodb connected!')
})

//把樣板引擎指定為 Handlebar，設定副檔名縮寫
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
//啟用樣版引擎 hbs
app.set('view engine', 'hbs')

//使用靜態檔
app.use(express.static('public'))
//每筆請求都要透過body-parser前置處理
app.use(bodyParser.urlencoded({ extended: true }))

// 設定 port 3000 （本地開發習慣用 3000)
// 請伺服器監聽 port 3000
// 任何從 port 3000 進來的瀏覽器請求，將會被 app 這支應用程式受理
app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`) //現在可以用這個網址連上我的主機
})

// 設定路由 - localhost:3000 開放哪些網址？
// 每一條網址都代表特定功能
// 設定首頁路由， / 對應到的是 localhost:3000/，表示根目錄
app.get('/', (req, res) => {
  Restaurant.find() //取出所有資料
    .lean() //把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then((restaurants) => res.render('index', { restaurants })) // 將資料傳給 index 樣板
    .catch((error) => console.log(error))
})

//設定前往新增頁面的路由
app.get('/restaurants/new', (req, res) => {
  return res.render('new')
})

//這條路由接住 Create 表單送過來的資料，往資料庫送
app.post('/restaurants', (req, res) => {
  console.log(req.body) //是一個物件
  const {
    name,
    category,
    rating,
    location,
    phone,
    google_map,
    description,
  } = req.body
  console.log(req.body.name)
  // 如果沒圖片，放一張假圖
  const image =
    req.body.image !== ''
      ? req.body.image
      : 'https://static.vecteezy.com/system/resources/previews/000/091/119/large_2x/free-restaurant-logo-on-paper-plate-vector.jpg'
  //另一種寫法：
  // if (!req.body.image.length) {
  //   req.body.image =
  //     'https://static.vecteezy.com/system/resources/previews/000/091/119/large_2x/free-restaurant-logo-on-paper-plate-vector.jpg'
  // }
  // const newRestaurant = req.body //從 req.body 拿出表單裡的 name 資料
  // return Restaurant.create(newRestaurant) //存入資料庫

  return Restaurant.create({
    name,
    category,
    image,
    rating,
    location,
    phone,
    google_map,
    description,
  })
    .then(() => res.redirect('/')) //新增完就返回首頁
    .catch((error) => console.log(error))
})

// 設定前往 detail 頁面路由
// :id 表示動態參數
app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id //從請求中截取 id
  return Restaurant.findById(id) //從資料庫以 id 去找到資料
    .lean() //轉換成單純的 JS 物件
    .then((restaurant) => res.render('detail', { restaurant })) //把資料送到前端樣板渲染
    .catch((error) => console.log(error))
})

//設定前往 edit 頁面的路由
//edit 頁面需要拿到資料庫中的資料
app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id //從請求中截取 id
  return Restaurant.findById(id) //從資料庫以 id 去找到資料
    .lean() //轉換成單純的 JS 物件
    .then((restaurant) => res.render('edit', { restaurant })) //把資料送到前端樣板渲染
    .catch((error) => console.log(error))
})

//新增路由，接住 edit 表單的資料，更新資料庫
app.post('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id //從請求中截取 id
  //拿到請求表單中的資料
  const name = req.body.name
  const name_en = req.body.name_en
  const category = req.body.category
  const image = req.body.image
  const location = req.body.location
  const phone = req.body.phone
  const google_map = req.body.google_map
  const rating = req.body.rating
  const description = req.body.description
  return (
    Restaurant.findById(id) //用 id 去資料庫找出那筆資料，成為 restaurant 參數傳入
      //如果查詢成功，幫我表單的資料存回該筆資料庫
      .then((restaurant) => {
        restaurant.name = name
        restaurant.name_en = name_en
        restaurant.category = category
        restaurant.image = image
        restaurant.location = location
        restaurant.phone = phone
        restaurant.google_map = google_map
        restaurant.rating = rating
        restaurant.description = description
        return restaurant.save()
      })
      //如果儲存成功，重新導向那筆的詳細頁面
      .then(() => res.redirect(`/restaurants/${id}`))
      .catch((error) => console.log(error))
  )
})

//新增刪除的路由
app.post('/restaurants/:id/delete', (req, res) => { 
  const id = req.params.id
  return Restaurant.findById(id) //去資料庫找到那筆資料
    .then((restaurant) => restaurant.remove()) //刪除這筆資料
    .then(() => res.redirect('/')) //完成後回首頁
    .catch((error) => console.log(error))
})