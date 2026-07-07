#!/usr/bin/env node


import download from 'download-git-repo'
// 根据download封装一个clone函数克隆git项目
const clone = (remote,name,options=false) =>{
    console.log('git clone')
    return new Promise((resolve,reject) =>{
        download(remote,name,(err) =>{
            if(err){
                reject(err)
                return
            }
            console.log('download success')
            resolve()
        })
    })
}

export default clone