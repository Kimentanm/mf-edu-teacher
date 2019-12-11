<template>
    <Modal v-model="modalSeen" width="300px" class-name="error-tip" :closable="false">
        <div slot="header" style="text-align: center;color: #ed4014;font-size: 18px">
            <Icon type="ios-close-circle" style="margin-right: 10px" :size="20"></Icon>
            <span>错误</span>
        </div>
        <div style="text-align: center;font-size: 18px;margin: 26px">
            <span>{{title}}</span>
        </div>
        <div slot="footer">
            <Button long @click="modalSeen = false">知道了</Button>
        </div>
    </Modal>
</template>

<script>
    export default {
        name: "errorTipModal",
        data() {
            return {
                modalSeen: false,
                title: ''
            }
        },
        methods: {
            show(title) {
                this.modalSeen = true;
                this.title = title;
            }
        }
    }
</script>

<style lang="less">
    .error-tip {
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal{
            top: 0;
        }

        .ivu-modal-body {
            padding: unset;
        }

        .ivu-modal-header-inner {
            text-align: center;
        }
    }
</style>