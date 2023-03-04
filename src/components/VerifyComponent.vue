<template>
  <el-popover trigger="manual" v-model="visible" placement="top">
    <div :style="`position: relative;cursor: ${cursor}`">
      <v-stage :config="configStage">
        <v-layer>
          <v-image :config="{
            image,
            ...configStage
          }"></v-image>
          <v-shape ref="shape" :config="shapeConfig"></v-shape>
        </v-layer>
        <v-layer>
          <v-group :config="configClip" @dragmove="dragSlice" ref="slice" @mousedown="cursor='grabbing'" @mouseup="cursor='grab'" @dragend="dragend" @mouseenter="cursor='grab'" @mouseleave="cursor='default'">
            <v-image :config="{
              image,
              ...configStage
            }"></v-image>
            <v-rect :config="{
              ...configStage,
              fill: 'rgba(255,255,255,0.1)'
            }">
            </v-rect>
          </v-group>
        </v-layer>
      </v-stage>
      <div class="tip error-tip" v-if="verifyState==='fail'">请正确拼合图像</div>
      <div class="tip success-tip" v-else-if="verifyState==='success'">验证成功</div>
    </div>
    <el-slider @change="verify" v-model="slidePosition" :show-tooltip="false"></el-slider>
    <div class="flex-between">
      <span>
        <el-tooltip content="关闭">
          <i class="el-icon-circle-close" @click="close"></i>
        </el-tooltip>
        <el-tooltip content="刷新">
          <i class="el-icon-refresh" @click="refresh"></i>
        </el-tooltip>
      </span>
      <span>拖动滑块完成拼图</span>
    </div>
    <slot name="reference" :verifyState="verifyState" slot="reference">
      <el-button @click.stop="clickBtn" :type="btnType" plain :class="[btnClass,{success:verifyState==='success'}]">
        <i :class="icon"></i>
        <span class="btn-text" style="margin-left: 10px;">{{btnText}}</span>
      </el-button>
    </slot>
  </el-popover>
</template>

<script>
import '@/plugins/element.js'
import '@/plugins/konva.js'
export default {
  name: 'VerifyComponent',
  props: {
    btnClass: String,
  },
  data () {
    return {
      configStage: {
        width: 260,
        height: 160
      },
      slidePosition: 0,
      image: null,
      shapeConfig: {
        x: 0,
        y: 0,
        fill: 'rgba(102,102,102,0.7)',
        sceneFunc: this.strockArc
      },
      visible: false,
      validPosition: {
        x: 0,
        y: 0
      },
      sliceIndex: 0,
      size: 52,
      radius: 6,
      verifyState: 'notverify',
      cursor: 'default',
      failTime: 0,
    }
  },
  created () {
    this.refresh()
  },
  computed: {
    initialX () {
      return (0 - this.validPosition.x) * (this.configStage.width - this.size) / 100
    },
    configClip() {
      const min = (0 - this.validPosition.x) * (this.configStage.width - this.size) / 100
      const max = (100 - this.validPosition.x) * (this.configStage.width - this.size) / 100
      return {
        x: (this.slidePosition - this.validPosition.x) * (this.configStage.width - this.size) / 100,
        draggable: true,
        dragBoundFunc: function(pos) {
          let { x } = pos
          x = Math.min(max, x)
          x = Math.max(min, x)
          return {
            x,
            y: this.absolutePosition().y
          }
        },
        clipFunc: (context) => {
          this.strockArc(context)
        }
      }
    },
    btnType () {
      switch (this.verifyState) {
        case 'success':
          return 'success'
        case 'fail':
          return 'danger'
        default:
          return 'default'
      }
    },
    btnText () {
      switch (this.verifyState) {
        case 'success':
          return '验证通过'
        case 'fail':
          return '验证失败'
        case 'verifying':
          return '拖动滑块完成拼图'
        default:
          return '点击验证'
      }
    },
    icon () {
      switch (this.verifyState) {
        case 'success':
          return 'el-icon-success'
        case 'fail':
          return 'el-icon-error'
        default:
          return 'el-icon-more'
      }
    }
  },
  methods: {
    clickBtn () {
      if (this.verifyState === 'success') {
        return
      }
      if (this.visible) {
        this.close()
      } else {
        this.open()
      }
    },
    verify (value) {
      const diff = Math.abs(this.validPosition.x - value)
      if (diff <= 2) {
        this.verifyState = 'success'
        setTimeout(() => {
          this.close()
          this.$emit('success')
        }, 500)
      } else {
        this.verifyState = 'fail'
        this.failTime++
        setTimeout(() => {
          if (this.failTime >= 5) {
            this.refresh()
          }
          this.slidePosition = 0
          this.verifyState = 'verifying'
        }, 500)
      }
    },
    open () {
      this.visible = true
      this.verifyState = 'verifying'
    },
    close () {
      this.visible = false
      if (this.verifyState !== 'success') {
        this.verifyState = 'notverify'
      }
    },
    // 重置验证状态
    reset () {
      this.verifyState = 'notverify'
      this.visible = false
      this.refresh()
    },
    refresh () {
      // 获取数据，刷新验证图片等
      const image = new Image()
      image.src = 'https://dl-yiyunsite.effio.cn/000000/captcha/04.jpg'
      image.onload = () => {
        this.image = image
      }
      this.validPosition = {
        x: Math.floor(Math.random() * 80) + 20,
        y: 50
      }
      this.sliceIndex = Math.floor(Math.random() * 9)
      this.slidePosition = 0
      this.failTime = 0
    },
    dragSlice () {
      const { x } = this.$refs.slice.getNode().getClientRect()
      this.slidePosition = (x - this.initialX) * 100 / (this.configStage.width - this.size)
    },
    dragend () {
      const { x } = this.$refs.slice.getNode().getClientRect()
      const percent = (x - this.initialX) * 100 / (this.configStage.width - this.size)
      this.verify(percent)
    },
    strockArc(ctx, shape) {
      ctx.beginPath()
      // 圆弧半径
      const r = this.radius
      // 切片大小
      const s = this.size - 2 * r
      let { x, y } = this.validPosition
      x = (this.configStage.width - this.size) * x / 100 + this.radius
      y = (this.configStage.height - this.size) * y / 100
      switch (this.sliceIndex) {
        case 0:
          //上凸下凹
          ctx.arc(x + s / 2, y, r, Math.PI, 2 * Math.PI)
          ctx.lineTo(x + s, y)
          ctx.lineTo(x + s, y + s)
          ctx.lineTo(x + s / 2 + r, y + s)
          ctx.arc(x + s / 2, y + s, r, 2 * Math.PI, Math.PI, true)
          ctx.lineTo(x, y + s)
          ctx.lineTo(x, y)
          break
        case 1:
          //上凸右凹
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s/2-r);
          ctx.arc(x+s,y+s/2,r,1.5*Math.PI,0.5*Math.PI,true);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x,y+s)
          ctx.lineTo(x,y)
          break
        case 2 :
          //上凸左凹
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x,y+s);
          ctx.lineTo(x,y+s/2+r);
          ctx.arc(x,y+s/2,r,0.5*Math.PI,1.5*Math.PI,true)
          ctx.lineTo(x,y)
          break
        case 3 :
          //上凸下凸
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x+s/2+r,y+s);
          ctx.arc(x+s/2,y+s,r,0,Math.PI);
          ctx.lineTo(x,y+s)
          ctx.lineTo(x,y)
          break
        case 4 :
          //上凸右凸
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI)
          ctx.lineTo(x+s,y)
          ctx.lineTo(x+s,y+s/2-r);
          ctx.arc(x+s,y+s/2,r,1.5*Math.PI,0.5*Math.PI)
          ctx.lineTo(x+s,y+s)
          ctx.lineTo(x,y+s)
          ctx.lineTo(x,y)
          break
        case 5 :
          //上凸右凸下凹
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s/2-r);
          ctx.arc(x+s,y+s/2,r,1.5*Math.PI,0.5*Math.PI);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x+s/2+r,y+s);
          ctx.arc(x+s/2,y+s,r,2*Math.PI,Math.PI,true);
          ctx.lineTo(x,y+s)
          ctx.lineTo(x,y)
          break
        case 6 :
          //上凸右凸左凹
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s/2-r);
          ctx.arc(x+s,y+s/2,r,1.5*Math.PI,0.5*Math.PI);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x,y+s);
          ctx.lineTo(x,y+s/2+r);
          ctx.arc(x,y+s/2,r,0.5*Math.PI,1.5*Math.PI,true)
          ctx.lineTo(x,y)
          break
        case 7 :
          //上凸下凸右凹
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s/2-r);
          ctx.arc(x+s,y+s/2,r,1.5*Math.PI,0.5*Math.PI,true);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x+s/2+r,y+s);
          ctx.arc(x+s/2,y+s,r,0,Math.PI);
          ctx.lineTo(x,y+s)
          ctx.lineTo(x,y)
          break
        case 8 :
          //上凸左凹右凹
          ctx.arc(x+s/2,y,r,Math.PI,2*Math.PI);
          ctx.lineTo(x+s,y);
          ctx.lineTo(x+s,y+s/2-r);
          ctx.arc(x+s,y+s/2,r,1.5*Math.PI,0.5*Math.PI,true);
          ctx.lineTo(x+s,y+s);
          ctx.lineTo(x,y+s);
          ctx.lineTo(x,y+s/2+r);
          ctx.arc(x,y+s/2,r,0.5*Math.PI,1.5*Math.PI,true)
          ctx.lineTo(x,y)
          break
      }
      ctx.closePath()
      ctx.strokeStyle = '#ffffff'
      ctx.stroke()
      if (shape) {
        ctx.fillStrokeShape(shape)
      }
    }
  }
}
</script>

<style scoped>
.el-button{
  padding: 10px;
  position: relative;
}
.el-button.success{
  cursor: default;
}
.el-icon-success,.el-icon-error,.el-icon-more{
  position: absolute;
  left: 10px;
}
.btn-text{
  display: inline-block;
  width: 150px;
}
.tip{
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 20px;
  font-size: 14px;
  color: #fff;
  text-align: center;
}
.tip.success-tip{
  background-color: #67C23A;
}
.tip.error-tip{
  background-color: #F56C6C;
}
.el-icon-circle-close,.el-icon-refresh{
  cursor: pointer;
  font-size: 18px;
  margin-right: 10px;
}
.flex-between{
  display: flex;
  justify-content: space-between;
}
</style>
