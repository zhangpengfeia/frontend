#!/usr/bin/env node
import clone from './gitClone.js'
import { program } from 'commander'


console.log("ff-cli start")
program
    .version('1.0.0')
    .description('ff-cli 命令行工具')

program
    .command('create <app-name>')
    .description('创建项目')

program.parse(process.argv)
// clone('yingside/webpack-template','test').then(() =>{
//     console.log('clone success')
// }).catch((err) =>{
//     console.log(err)
// })