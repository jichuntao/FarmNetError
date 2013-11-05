/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 13-11-4
 * Time: 下午7:04
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs');
var lineReader = require('line-reader');
var util = require('util');
var zlib = require('zlib');
var query = require("querystring");
var path='/mnt/farmweblog3/netError/';
//var path='./xxx/';
var ret={};
var retArr=[];

var datedir='2013_11_3';

var langdir=[];
var langindex=0;
var over=false;

function exe(req, res, rf, data) {
   over=false;
    var qu = query.parse(data);
    datedir = qu['date'];
    console.log(qu);
    var i=20;
    var ss=setInterval(function(){
        if(i--<0){
            res.end('ok');
            clearInterval(ss);
            return;
        }
        if(over){
            res.end('ok');
            clearInterval(ss);
        }
    },1000);
    start();
}
//开始执行
function start() {
    langdir=fs.readdirSync(path+datedir+'/');
    langindex=0;
    nextfile();
}
//下一个文件
function nextfile(){
    if(langindex>=langdir.length){
        over=true;
        console.log('Over');
        return;
    }
    ret={};
    retArr=[];
    console.log(path+datedir+'/'+langdir[langindex]+'/'+datedir+'_netError_'+langdir[langindex]+'.log');
    openfile(path+datedir+'/'+langdir[langindex]+'/'+datedir+'_netError_'+langdir[langindex]+'.log');
}
//开始打开文件
function openfile(filename) {
    lineReader.eachLine(filename, function (line, last, cb) {
        exec(line, function () {
            if (last) {
                var obj={};
                obj.data=retArr;
                obj.ret=ret;
                zlib.deflate(JSON.stringify(obj), function(err, buffer) {
                    if (!err) {
                        fs.writeFileSync('./static_file/'+datedir+'_'+langdir[langindex]+'.json',buffer );
                    }
                    langindex++;
                    wirteConfig();
                    nextfile();
                    cb(false);
                });
                return;
            }
            cb();
        });
    });
}

function wirteConfig(){
    var str=fs.readFileSync('./static_file/config.json','utf8');
    var config=JSON.parse(str);
    config[datedir]=true;
    fs.writeFileSync('./static_file/config.json',JSON.stringify(config));
}
function exec(strs, cb) {
    try {
        var data = strs.substr(strs.indexOf('{'));
        var key = strs.substring(0, strs.indexOf('{') - 1);
        var obj = JSON.parse(data);
        var logtime = key.split('-')[0];
        var lang = key.split('-')[2];
        var uid = obj.uid;
        var date=new Date(logtime*1000);
        if(obj.errarr.length==0){
            pushObj('_0');
            retArr.push({time:logtime,type:0});
        }else{
            if(obj.errarr[0].msg.description=='HTTP: Status 503'){
                pushObj('_1');
                retArr.push({time:logtime,type:1});
            }else if(obj.errarr[0].msg.description=='HTTP: Status 502'){
                pushObj('_2');
                retArr.push({time:logtime,type:2});
            }else if(obj.errarr[0].msg.description=='HTTP: Failed'){
                pushObj('_3');
                retArr.push({time:logtime,type:3});
            }else{
                retArr.push({time:logtime,type:4});
                pushObj('_4');
            }

        }

        cb();
    }
    catch (e){
        console.log('Err:0'+e);
        cb();
    }
}

function pushObj(key){
    if(!ret[key]){
        ret[key]=0;
    }
    ret[key]++;
}

exports.exe=exe;