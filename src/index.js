const cors=require('cors');
const express=require('express');
const url=require("url");
const path=require("path");
const events = require('events');
const puppeteer = require('puppeteer');
const mine = require('./mime.json')

const app=express();
const port=8081
var EventEmitter=null;
//允许跨域请求
app.use(cors());

app.get('/',(req,res)=>{
    var urlobj=url.parse(req.url,true,false);
    var link=urlobj.query.url;
    var filename=new Date().Format("yyyyMMddhhmmss")+".jpg";
    EventEmitter=null;
    if(filename!=""&&filename!=undefined){
        EventEmitter = new events.EventEmitter();
        GetScreenShot(link,filename);
    }

    if(EventEmitter!=null){
        EventEmitter.on("capevent",function()
        {
            res.send("http://www.rdonly.com/onlinecapture/"+filename);
        });
    }
});

app.listen(port,()=>console.log("服务启动"));


//截图
function GetScreenShot(url,filename){
    (async () => {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        // await page.emulate(puppeteer.devices['iPhone 6']);
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url);
        await page.screenshot({ path: filename, fullPage: false });
        await browser.close();
        EventEmitter.emit("capevent");
    })();
}

//日期时间格式化
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, // 月份
        "d+": this.getDate(), // 日
        "h+": this.getHours(), // 小时
        "m+": this.getMinutes(), // 分
        "s+": this.getSeconds(), // 秒
        "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
        "S": this.getMilliseconds()
        // 毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) :
                (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}