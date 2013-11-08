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
var retRetry={};

var datedir='2013_11_3';
var langdir='am';


function exe(req, res, rf, data) {
    var qu = query.parse(data);
    datedir = qu['date'];
    langdir = qu['lang'];
    ret={};
    retArr=[];
    var retRetry=[];
    var filename=path+datedir+'/'+langdir+'/'+datedir+'_netError_'+langdir+'.log';
    openfile(filename,function(data){
        res.write(data, "binary");
        res.end();
    });
}

//开始打开文件
function openfile(filename,callback) {
    lineReader.eachLine(filename, function (line, last, cb) {
        exec(line, function () {
            if (last) {
                var obj={};
                obj.data=retArr;
            obj.ret=ret;
            obj.retry=retRetry;
            zlib.deflate(JSON.stringify(obj), function(err, buffer) {
                callback(buffer);
                cb(false);
            });
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
        var retryStates=false;
        if(obj.retryStates){
            retryStates=obj.retryStates;
        }
        if(obj.errarr.length==0){
            pushObj('_0');
            pushObj_retry('_0',retryStates);
            retArr.push({time:logtime,type:0,retryStates:retryStates});
        }else{
            if(obj.errarr[0].msg.description=='HTTP: Status 503'){
                pushObj('_1');
                pushObj_retry('_1',retryStates);
                retArr.push({time:logtime,type:1,retryStates:retryStates});
            }else if(obj.errarr[0].msg.description=='HTTP: Status 502'){
                pushObj('_2');
                pushObj_retry('_2',retryStates);
                retArr.push({time:logtime,type:2,retryStates:retryStates});
            }else if(obj.errarr[0].msg.description=='HTTP: Failed'){
                pushObj('_3');
                pushObj_retry('_3',retryStates);
                retArr.push({time:logtime,type:3,retryStates:retryStates});
            }else{
                pushObj_retry('_4',retryStates);
                retArr.push({time:logtime,type:4,retryStates:retryStates});
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
function pushObj_retry(key,retryStates){
    if(!retryStates){
        return;
    }
    if(!retRetry[key]){
        retRetry[key]=0;
    }
    retRetry[key]++;
}
exports.exe=exe;