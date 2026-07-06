import esbuild from 'esbuild'
import time from 'esbuild-plugin-time'

(async () => {
   const ctx = await esbuild.context({
        entryPoints: ['src/App.tsx'],
        outfile: './public/dist/App.js', // 输出目录
        minify: false, // 压缩代码
        bundle: true,
        sourcemap: true, // 生成 sourcemap 文件
        target: ["es2020","chrome58"],
        loader: {
            '.svg': 'dataurl', // 处理 SVG 文件
            '.module.css': 'local-css', // 处理模块 CSS 文件
        },
        plugins: [
            time()
        ],
    })
   await ctx.watch() // 监听文件变化
   
   ctx.serve({
        port: 8080,
        host: 'localhost',
        servedir: './public',
   }).then(() => {
        console.log('Server is running on http://localhost:8080')
   })
})()
