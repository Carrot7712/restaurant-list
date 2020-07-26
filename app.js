// 載入 express 
const express = require('express')
// 呼叫 express 會啟動 Express 應用程式伺服器，用 app 這個變數來代表伺服器
// 此伺服器不同於資料庫伺服器
const app = express()

// 設定路由 - localhost:3000 開放哪些網址？
// 每一條網址都代表特定功能
// 設定首頁路由， / 對應到的是 localhost:3000/，表示根目錄
app.get('/', (req, res) => {
  res.send('hello world')
})

// 設定 port 3000 （本地開發習慣用 3000)
// 請伺服器監聽 port 3000 
// 任何從 port 3000 進來的瀏覽器請求，將會被 app 這支應用程式受理
app.listen(3000, () => {
  console.log('App is running on http://localhost:3000') //現在可以用這個網址連上我的主機
})

const mongoose = require('mongoose') // 載入 mongoose
// 設定連線到 mongoDB
                            // 資料庫伺服器位置  資料庫名稱
mongoose.connect('mongodb://localhost/todo-list', {
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