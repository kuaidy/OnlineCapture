const http = require('http');
const fs=require("fs");
const url=require("url");
const path=require("path");
const events = require('events');
const puppeteer = require('puppeteer');
const mine = require('./mime.json')


var EventEmitter=null;

http.createServer(function(req,res) {
    // var urlinfo=url.parse(req.url,true);
    // console.log(urlinfo);

    //截图
    var link=url.parse(req.url,true).query.url;
    var filename=url.parse(req.url,true).query.filename;
    //console.log(link);

    //请求路径
    var pathname = url.parse(req.url).pathname;
    EventEmitter=null;
    if(filename!=""&&filename!=undefined){
        EventEmitter = new events.EventEmitter();
        GetScreenShot(link,filename);
    }

    if(EventEmitter!=null){
        EventEmitter.on("capevent",function(){
            fs.readFile(pathname.substr(1),function(err,data){
                if(err){
                    res.writeHead(404,{'Content-Type':'text/html'});
                }else{
                    var ContentType = 'text/html';
                    var ext = path.extname(pathname)
                    if(mine[ext]){
                        ContentType = mine[ext]
                    }
                    res.writeHead(200,{'Content-Type':ContentType});
                    if(link!=""&&link!=undefined){
                        res.write(data.toString().replace("{{ImageUrl}}","http://www.rdonly.com:8081/"+filename));
                    }else{
                        res.write(data);
                    }
                }
                res.end();
            });
        });
    }else{
        fs.readFile(pathname.substr(1),function(err,data){
            if(err){
                res.writeHead(404,{'Content-Type':'text/html'});
            }else{
                var ContentType = 'text/html';
                var ext = path.extname(pathname)
                if(mine[ext]){
                    ContentType = mine[ext]
                }
                res.writeHead(200,{'Content-Type':ContentType});
                res.write(data);
            }
            res.end();
        });
    }
    //console.log(pathname);
}).listen(8081);


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
