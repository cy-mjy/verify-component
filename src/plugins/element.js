import Vue from 'vue'
import { Button, Slider, Popover, Icon, Tooltip, Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(Button)
Vue.use(Slider)
Vue.use(Popover)
Vue.use(Icon)
Vue.use(Tooltip)
Vue.prototype.$message = Message
