<template>
    <div class="border-angle">
        <div :style="{height: width + 'px', width: width + 'px'}">
            <span class="border-angle-before" :style="beforeStyle"/>
            <span class="border-angle-after" :style="afterStyle"/>
        </div>
        <span class="content-text" :style="contentTextStyle">{{contentText}}</span>
    </div>
</template>

<script>
    export default {
        name: "borderAngle",
        components: {},
        data() {
            return {}
        },
        props: {
            width: {
                type: Number,
                default: 72
            },
            lineWidth: {
                type: Number,
                default: 10
            },
            color: {
                type: String,
                default: "red"
            },
            contentText: String,
            fontSize: {
                type: Number,
                default: 12
            },
        },
        watch: {},
        computed: {
            beforeStyle() {
                return {
                    border: `${this.width / 2}px solid transparent`,
                    borderLeft: `${this.width / 2}px solid ${this.color}`,
                    borderBottom: `${this.width / 2}px solid ${this.color}`,
                }
            },
            afterStyle() {
                let width = this.width - (Math.sqrt(2) * this.lineWidth);
                return {
                    border: `${width / 2}px solid transparent`,
                    borderLeft: `${width / 2}px solid #fff`,
                    borderBottom: `${width / 2}px solid #fff`,
                }
            },
            contentTextStyle() {
                const result = (this.width / 2) - (Math.sqrt(2) / 4 * this.lineWidth);
                return {
                    top: `${result}px`,
                    right: `${result}px`,
                    fontSize: `${this.fontSize}px`
                }
            }
        },
        methods: {},
        created() {
        }
    }
</script>

<style lang="less">
    .border-angle {
        position: absolute;
        top: 0;
        right: 0;

        .content-text {
            position: absolute;
            transform: translate(50%, -50%) rotate(45deg);
            color: #fff;
            font-weight: bold;
        }

        div {
            position: relative;
            box-sizing: border-box;
            text-indent: 5px;
        }

        .border-angle-before {
            content: "";
            position: absolute;
            left: 0;
            bottom: 0;
            width: 0;
            height: 0;
            transform: rotate(180deg);
        }

        .border-angle-after {
            content: "";
            position: absolute;
            right: -1px;
            top: 0;
            width: 0;
            height: 0;
            transform: rotate(180deg);
        }
    }
</style>