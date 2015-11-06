/**
 * Created by cuihonglei on 15/11/5.
 */
var http = require('http');//HTTP服务和客户端功能
var fs   = require('fs');  //文件系统相关相关的功能
var path = require('path');// 内置的path模块提供了与文件系统路径相关的功能
var mime = require('mime');// 根据文件扩展名得出MIME类型的能力
var cache = {};            // cache是用来缓存文件内容的对象

// 提供静态HTTP文件服务

function send404(response){
    response.writeHead(404,{'content-type':'text/plain'});
    response.write('Error 404:resource not found');
    response.end();
}

function sendFile(response,filePath,fileContents){
    response.writeHead(
        200,
        {'content-type':mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

function serverStatic(response,cache,absPath){
    if(cache[absPath]){
        sendFile(response,absPath,cache[absPath]);
    }else{
        fs.exists(absPath,function(exists){
            if(exists){
                fs.readFile(absPath,function() {
                    if(err){
                     send404(response);
                    }else{
                        cache[absPath] = data;
                        sendFile(response,absPath,data);
                    }
                    });
            }else{
                send404(response)
            }
        });
    }
}

