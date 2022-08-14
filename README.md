# 簡易股票記帳
台股買賣紀錄、股利發放紀錄以及損益試算。
## 網頁連結
[https://stock-accounting.herokuapp.com](https://stock-accounting.herokuapp.com)
## 功能說明
+ 使用者可註冊帳號
+ 使用者可使用帳號與密碼登入
+ 可新增、刪除股票買賣紀錄
+ 可新增、刪除股利紀錄
+ 每日 3:00 自動新增當日股利
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
