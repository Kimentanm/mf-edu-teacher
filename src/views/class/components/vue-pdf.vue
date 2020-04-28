<template>
    <div class="vue-pdf" :id="'vue-pdf-' + src">
        <pdf ref="vue-pdf" :src="src" :page="currentPage" @num-pages="getPageCount" @page-loaded="handlePageLoaded" ></pdf>
    </div>
</template>

<script>
    import pdf from 'vue-pdf'
    export default {
        name: "vue-pdf",
        components: {pdf},
        props: {
            src: String
        },
        data() {
            return {
                pdfDom: undefined,
                currentPage: 1,
                pageCount: 0
            }
        },
        computed: {},
        watch: {},
        methods: {
            handlePageLoaded(val) {
                this.currentPage = val;
                this.$emit('page-loaded');
                console.log('页面加载完成');
            },
            scrollListener() {
                let scrollHeight = this.pdfDom.firstChild.clientHeight - this.pdfDom.clientHeight;
                let scrollTop = this.pdfDom.scrollTop;
                this.$emit('on-pdfScroll', scrollTop, scrollHeight)
            },
            // 改变PDF页码,val传过来区分上一页下一页的值,0上一页,1下一页
            changePdfPage (val) {
                let flag = JSON.parse(JSON.stringify(this.currentPage));
                if (val === 0) {
                    flag--;
                    if (flag < 1) {
                        this.$Message.warning('当前是第一页')
                    } else {
                        this.currentPage = flag;
                    }
                }
                if (val === 1) {
                    flag++;
                    if (flag > this.pageCount) {
                        this.$Message.warning('当前已经是最后一页啦')
                    } else {
                        this.currentPage = flag;
                    }
                }
            },
            getPageCount(val) {
                this.pageCount = val;
            }
        },
        mounted() {
            this.pdfDom = document.getElementById('vue-pdf-' + this.src)
            this.pdfDom.addEventListener('scroll', this.scrollListener);
        },
        created() {
        },
        beforeDestroy() {
            this.pdfDom.removeEventListener('scroll', this.scrollListener);
        }
    }
</script>

<style lang="less">
    .vue-pdf {
        height: 100%;
        width: 100%;
        overflow-y: auto;
        max-width: 1000px;
        margin: 0 auto;
    }
</style>
