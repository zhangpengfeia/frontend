# 自定义脚手架
优点：
1.自定义webpack初始化配置
2.工程化配置
3.一些前端工具链的配置 eslint，prettier，stylelint等
4.常用api封装，相关依赖封装

# 步骤
1.package.json 配置 bin 脚本
2.npm link
3.git拉取包 download-git-repo
4.commander 配置命令行参数解析，shll美化
5.创建选取 template 模板脚本
6.脚手架 name, version, description, author, license 修改
6.npm发布，发布脚本
