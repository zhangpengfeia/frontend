# 主题切换
思路：其实就是切换css，颜色，图片相关属性
方案：
1. css变量-xx-xx 控制切换
    过程：
    1. 定义css变量主题
    2. js切换主题变量，class
    3. 创建useTheme hook，保存主题变量，pinia
    4. 根据系统主题，切换主题变量 window.matchMedia('(prefers-color-scheme: dark)')
2. 使用前端预处理器，比如scss，less等
    使用预处理器的函数，混入等特性处理主题切换的样式




