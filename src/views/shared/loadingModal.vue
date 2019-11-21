<template>
    <Modal v-model="show" :title="title" width="300px" class-name="login-loading" :closable="false">
        <Spin>
            <Icon type="ios-loading" size=18 class="spin-icon-load"></Icon>
        </Spin>
        <div slot="footer">

        </div>
    </Modal>
</template>

<script>
    export default {
        name: "loadingModal",
        props: {
            show: Boolean,
            title: String
        }
    }
</script>

<style lang="less">
    .login-loading {
        display: flex;
        align-items: center;
        justify-content: center;

    .ivu-modal{
        top: 0;
    }

    .ivu-modal-body {
        padding: unset;
    }

    .spin-icon-load {
        font-size: 32px !important;
        animation: ani-demo-spin 1s linear infinite;
    }

    .ivu-modal-header {
        border-bottom: unset;
    }

    .ivu-modal-header-inner {
        text-align: center;
    }

    .ivu-modal-footer {
        border-top: unset;
    }
    }
</style>