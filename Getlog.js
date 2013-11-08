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

var datedir='2013_11_6';
var langdir='am';



start();


//开始执行
function start() {
    ret={};
    retArr=[];
    openfile(path+datedir+'/'+langdir+'/'+datedir+'_netError_'+langdir+'.log');
}

//开始打开文件
function openfile(filename) {
    lineReader.eachLine(filename, function (line, last, cb) {
        exec(line, function () {
            if (last) {
                var obj={};
                obj.data=retArr;
                obj.ret=ret;
//                zlib.deflate(JSON.stringify(obj), function(err, buffer) {
//                    if (!err) {
//                        fs.writeFileSync('./static_file/'+datedir+'_'+langdir[langindex]+'.json',buffer );
//                    }
                    cb(false);
//                });
                console.log('ok');
                return;
            }
            cb();
        });
    });
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

