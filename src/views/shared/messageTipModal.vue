<template>
    <Modal v-model="modalSeen" width="300px" class-name="message-tip" :closable="false">
        <div slot="header" style="text-align: center;color: #2d8cf0;font-size: 18px">
            <Icon type="md-alert" style="margin-right: 10px" :size="20"></Icon>
            <span>确认</span>
        </div>
        <div style="text-align: center;font-size: 18px;margin: 26px">
            <span>{{title}}</span>
        </div>
        <div slot="footer">
            <Button @click="sure">确定</Button>
        </div>
    </Modal>
</template>

<script>
    export default {
        name: "messageTipModal",
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
            },
            sure() {
                this.modalSeen = false;
                this.$emit('on-sure')
            }
        }
    }
</script>

<style lang="less">
    .message-tip {
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