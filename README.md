# 簡易股票記帳
台股買賣紀錄、股利發放紀錄以及損益試算。
## 網頁連結
[https://stock-accounting.herokuapp.com](https://stock-accounting.herokuapp.com)
## 功能說明
+ 使用者可註冊帳號
+ 使用者可修改名稱與密碼
+ 忘記密碼時可進行重設
+ 可新增、修改和刪除股票買賣紀錄
+ 可新增和刪除股利紀錄
+ 每日 9:00 自動新增當日股利
+ 可查看個別股票報酬率
+ 可查看總報酬率
+ 可查看已實現損益
## 安裝流程
1. 請確認有安裝 Node.js 與 npm
2. 將專案 clone 到本地
```
git clone https://github.com/JuneChen1/stock-accounting.git
```
3. 進入專案資料夾
```
cd stock-accounting
```
4. 安裝套件
```
npm install
```
5. 將 .env.example 檔名更改為 .env，並新增 MongoDB 連線 URI
```
MONGODB_URI=
SESSION_SECRET='ThisIsMySecret'
```
6. 啟動伺服器
```
npm run start
```
7. 當終端機出現以下訊息，代表伺服器已成功啟動
```
Express is running on http://localhost:3000
```
8. 當終端機出現以下訊息，代表 MongoDB 連線成功
```
mongodb connected
```
9. 開啟瀏覽器輸入 http://localhost:3000
## 環境建置
+ Node.js 16.15.0
+ Express 4.18.1
+ Memorystore 1.6.7
+ Express-handlebars 6.0.6
+ Mongoose 6.3.8
+ Bootstrap 5.1.3
+ Dotenv 16.0.1
+ Method-override 3.0.0
+ Moment 2.29.3
+ Axios 0.27.2
+ Passport 0.4.1
+ Passport-local 1.0.0
+ Bcryptjs 2.4.3
+ Node-schedule 2.1.0
+ Sweetalert2 11.4.28
+ Nodemailer 6.7.8
## 筆記
[自動記錄股利](https://medium.com/@juneee/%E4%BD%BF%E7%94%A8-node-schedule-%E8%87%AA%E5%8B%95%E8%A8%98%E9%8C%84%E8%82%A1%E5%88%A9-468af2943032)  
[忘記密碼功能](https://medium.com/@juneee/%E4%BD%BF%E7%94%A8-node-js-%E5%AF%A6%E4%BD%9C%E5%BF%98%E8%A8%98%E5%AF%86%E7%A2%BC%E5%8A%9F%E8%83%BD-84b9fb8b1cb7)
