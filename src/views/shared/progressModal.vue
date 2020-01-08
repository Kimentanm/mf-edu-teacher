<template>
    <Modal v-model="show" :title="title" width="400px" class-name="progress-modal" :closable="false"
           :mask-closable="false">
        <Progress :percent="percent" status="active" :stroke-color="['#108ee9', '#87d068']"/>
        <p class="size">
            <span>{{transferred}} MB</span> /
            <span>{{total}} MB</span>
        </p>
        <div slot="footer">

        </div>
    </Modal>
</template>

<script>
    export default {
        name: "progressModal",
        props: {
            show: Boolean,
            title: String,
            percent: Number,
            transferred: Number,
            total: Number
        }
    }
</script>

<style lang="less">
    .progress-modal {
        display: flex;
        align-items: center;
        justify-content: center;

        .size {
            text-align: center;
            margin-top: 10px;
        }

        .ivu-modal {
            top: 0;
        }

        .ivu-modal-body {
            padding: 20px 30px;
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