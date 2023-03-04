# Verify Component

滑块登录组件

## 示例

![示例](https://github.com/cy-mjy/verify-component/raw/master/example.jpeg)


## 使用
```
import Vue from 'vue'
import VerifyComponent from 'verify-component'
Vue.use(VerifyComponent)
<verify-component @success="onSuccess"></verify-component>
```
### props
```
btnClass 给默认的按钮加上class
```
### slot
```
slot-name "reference" 替换默认的按钮
```
### events
success 验证成功 参数 登录时的参数sign
### methods
```
open() 打开验证码弹窗
close() 关闭验证码弹窗
reset() 重置验证状态
```
