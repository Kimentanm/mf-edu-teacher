<template>
    <div ref="draw-board-container" class="draw-board-container" style="position: relative">
        <iframe id="my-iframe" :src="url" frameborder="0"></iframe>
        <div class="draw-board-toolbar">
            <div class="draw-board-toolbar-content">
                <div style="text-align: center">
                    <Tooltip content="画笔" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('line')" style="margin-bottom: 10px" shape="circle" icon="ios-brush"></Button>
                    </Tooltip>
                    <Poptip placement="left" width="20" popper-class="toolbar-line-width">
                        <Tooltip content="线宽" placement="left" :offset="-4" theme="light">
                            <Button style="margin-bottom: 10px" shape="circle" icon="md-resize"></Button>
                        </Tooltip>
                        <el-slider @change="lineWidthChange" slot="content" v-model="lineWidth" :max="20" vertical height="120px"></el-slider>
                    </Poptip>
                    <Tooltip content="上一步" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('cancel')" style="margin-bottom: 10px" shape="circle" icon="ios-redo"></Button>
                    </Tooltip>
                    <Tooltip content="橡皮擦" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('eraser')" style="margin-bottom: 10px" shape="circle" icon="ios-pint"></Button>
                    </Tooltip>
                    <Tooltip content="清屏" placement="left" :offset="-4" theme="light">
                        <Button @click="handleClick('clear')" style="margin-bottom: 10px" shape="circle" icon="md-trash"></Button>
                    </Tooltip>
                    <Tooltip content="颜色" placement="left" :offset="-4" theme="light">
                        <ColorPicker class="toolbar-color" @on-change="colorChange" v-model="color" alpha :colors="recommendColors"></ColorPicker>
                    </Tooltip>
                    <Tooltip content="上一个动画" placement="left" :offset="-4" theme="light">
                        <Button @click="back" style="margin-bottom: 10px" type="success" shape="circle" icon="ios-skip-backward"></Button>
                    </Tooltip>
                    <Tooltip content="下一个动画" placement="left" :offset="-4" theme="light">
                        <Button @click="next" type="success" shape="circle" icon="ios-skip-forward"></Button>
                    </Tooltip>
                </div>
            </div>
        </div>
        <div ref="palette-content" class="palette-content" :class="handleCanvasCursor">
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>

<script>
    let Mousetrap = require('mousetrap');
    import {Palette} from '../../libs/palette';

    export default {
        name: "draw-board",
        components: {},
        data() {
            return {
                url: 'http://ow365.cn/?i=20087&n=5&furl=http://www.amaxchina.xyz/download/test.pptx',
                myIframeWindow: {},
                color: '#ed4014',
                recommendColors: ['#2d8cf0', '#5cadff', '#2b85e4', '#2db7f5', '#19be6b', '#ff9900',
                    '#ed4014', '#000', '#17233d', '#515a6e', '#808695', '#c5c8ce', '#fff'],
                currHandle: 'line',
                lineWidth: 5,
                palette: null, // 画板,
                allowCancel: true,
                allowGo: true,
                peer: null,
                channel: null
            }
        },
        props: {},
        watch: {},
        computed: {
            handleCanvasCursor() {
                let result = '';
                switch (this.currHandle) {
                    case "line": result = 'cursor-pen'; break;
                    case "eraser" : result = 'cursor-eraser'; break;
                    default:
                }
                return result;
            }
        },
        methods: {
            initPeer() {
                // 创建输出端 PeerConnection
                let PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                this.peer = new PeerConnection();
                // 监听ICE候选信息 如果收集到，就发送给对方
                this.peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        let message = {sender: this.userId, receiver: 276, sdp: event.candidate};
                        this.$stompClient.send('/sendPaletteICE', JSON.stringify(message), {});
                    }
                };
            },

            handleClick(type) {
                if (['cancel', 'go', 'clear'].includes(type)) {
                    this.palette[type]();
                    return;
                }
                this.palette.changeWay({type: type});
                if (['color', 'lineWidth'].includes(type)) return;
                this.currHandle = type;
            },
            colorChange() {
                this.palette.changeWay({color: this.color});
            },
            lineWidthChange() {
                this.palette.changeWay({lineWidth: this.lineWidth});
            },
            back() {
                this.myIframeWindow.postMessage("preAnim", '*');
                let message = {
                    sender: this.userId,
                    receiver: 276,
                };
                this.$stompClient.send('/back', JSON.stringify(message), {});
            },
            next() {
                this.myIframeWindow.postMessage("nextAnim", '*');
                let message = {
                    sender: this.userId,
                    receiver: 276,
                };
                this.$stompClient.send('/next', JSON.stringify(message), {});
            },
            handlePaletteResize() {
                let width = this.$refs['draw-board-container'].offsetWidth - 56;
                let height = this.$refs['draw-board-container'].offsetHeight;
                let canvasWidth = (height - 35) * 148732 / 83700;
                let canvasHeight = width * 2569 / 4565;
                this.$refs['canvas'].width = canvasHeight < height ? width : canvasWidth;
                this.$refs['canvas'].height = canvasHeight < height ? canvasHeight : height;
                this.$refs['palette-content'].style.width = width + 'px';
                this.$refs['palette-content'].style.height = (canvasHeight < height ? JSON.parse(JSON.stringify(this.$refs['canvas'].height)) + 35
                    : this.$refs['canvas'].height) + 'px';
                if (canvasHeight >= height) {
                    this.$refs['canvas'].height -= 35;
                }
            },
            initPalette() {
                this.palette = new Palette(this.$refs['canvas'], {
                    drawColor: this.color,
                    drawType: this.currHandle,
                    lineWidth: this.lineWidth,
                    allowCallback: this.allowCallback,
                    moveCallback: this.moveCallback
                });
            },
            allowCallback(cancel, go) {
                this.allowCancel = !cancel;
                this.allowGo = !go;
            },
            moveCallback(...arr) {
                this.channel.send(JSON.stringify(arr));
            },
            async onGetPaletteOffer(data) {
                try {
                    // 接收端设置远程 offer 描述
                    await this.peer.setRemoteDescription(data.sdp);
                    // 接收端创建 answer
                    let answer = await this.peer.createAnswer();
                    // 接收端设置本地 answer 描述
                    await this.peer.setLocalDescription(answer);
                    let message = {
                        sender: this.userId,
                        receiver: 276,
                        sdp: answer
                    };
                    this.$stompClient.send('/sendPaletteAnswer', JSON.stringify(message), {});
                } catch (e) {
                    console.log('onOffer: ', e);
                }
            },
            async onGetPaletteAnswer(data) {
                try {
                    await this.peer.setRemoteDescription(data.sdp); // 呼叫端设置远程 answer 描述
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
            async onGetPaletteICE(data) {
                try {
                    await this.peer.addIceCandidate(data.sdp); // 设置远程 ICE
                } catch (e) {
                    console.log('onAnswer: ', e);
                }
            },
            handleWebSocketEvent() {
                this.$bus.on('on-getPaletteOffer', this.onGetPaletteOffer);
                this.$bus.on('on-getPaletteAnswer', this.onGetPaletteAnswer);
                this.$bus.on('on-getPaletteICE', this.onGetPaletteICE);
            },
            createDataChannel() { // 创建 DataChannel
                try{
                    this.channel = this.peer.createDataChannel('messagechannel');
                } catch (e) {
                    console.log('createDataChannel:', e);
                }
            },
            onDataChannel() { // 接收 DataChannel
                this.peer.ondatachannel = (event) => {
                    this.channel = event.channel;
                    this.handleChannel(this.channel);
                };
            },
            handleChannel(channel) { // 处理 channel
                channel.binaryType = 'arraybuffer';
                channel.onopen = (event) => { // 连接成功
                    console.log('channel onopen', event);
                    this.loading = false;
                    this.initPalette();
                };
                channel.onclose = function(event) { // 连接关闭
                    console.log('channel onclose', event)
                };
                channel.onmessage = (e) => { // 收到消息
                    console.log(e);
                    let [type, ...arr] = JSON.parse(e.data);
                    this.palette[type](...arr);
                };
            },
        },
        mounted() {
            this.myIframeWindow = document.getElementById('my-iframe').contentWindow;
            this.handleWebSocketEvent();
            window.onresize = () => {
                this.handlePaletteResize();
            };
            this.$nextTick(async () => {
                this.handlePaletteResize();
                this.initPalette();
                await this.initPeer();
                await this.createDataChannel();
                this.onDataChannel();
            });
        },
        created() {
            Mousetrap.bind(['command+z', 'ctrl+z'], () => {
                this.handleClick('cancel');
                return false;
            });
            Mousetrap.bind(['command+shift+z', 'ctrl+shift+z'], () => {
                this.handleClick('go');
                return false;
            });
        }
    }
</script>

<style lang="less">
    .draw-board-container {
        width: ~"calc(100% - 240px)";
        height: 100%;
        display: inline-block;
        vertical-align: top;
        padding-left: 16px;
        position: relative;

        .palette-content {
            position: absolute;
            top: 50%;
            left: 16px;
            transform: translateY(-50%);
            text-align: center;
        }

        iframe {
            height: 100%;
            display: inline-block;
            width: ~"calc(100% - 40px)";
            pointer-events: none;
        }

        .cursor-pen {
            cursor: url("../../assets/images/test2.ico") 0 30, auto;
        }

        .cursor-eraser {
            cursor: url("../../assets/images/palette-eraser.ico") 4 30, auto;
        }

        .draw-board-toolbar {
            display: inline-block;
            vertical-align: top;
            width: 40px;
            height: 100%;
            background-color: rgba(255,255,255, 0.5);

            &-content {
                height: 100%;
                display: flex;
                align-items: center;

                .toolbar-line-width {
                    min-width: 86px;

                    .ivu-poptip-body-content {
                        overflow: unset;
                    }
                }

                .toolbar-color {

                    i {
                        display: none;
                    }

                    .ivu-input-icon-normal+.ivu-input {
                        padding-right: 7px;
                        border-radius: 50px;
                        cursor: pointer;

                        .ivu-color-picker-color {
                            width: 14px;
                            height: 14px;
                            top: 4px;
                        }
                    }

                    margin-bottom: 10px;
                }
            }
        }
    }
</style>