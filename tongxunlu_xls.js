/**
 * Created with JetBrains WebStorm.
 * User: jichuntao
 * Date: 14-8-7
 * Time: 下午3:11
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs');
function exe(req, res, rf, data) {
        fs.appendFileSync('aaa.log',req.headers['x-forwarded-for']);
        fs.appendFileSync('aaa.log',req.connection.remoteAddress);
        fs.appendFileSync('aaa.log',req.socket.remoteAddress);
        console.log(req.headers['x-forwarded-for']);
        console.log(req.connection.remoteAddress);
        console.log(req.socket.remoteAddress);
        res.write('asdasd');
        res.end();
}
exports.exe=exe;