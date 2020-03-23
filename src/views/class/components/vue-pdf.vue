<template>
    <div class="vue-pdf" :id="'vue-pdf-' + src">
        <pdf ref="vue-pdf" :src="src" @page-loaded="handlePageLoaded" ></pdf>
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
                pdfDom: undefined
            }
        },
        computed: {},
        watch: {},
        methods: {
            handlePageLoaded() {
                this.$emit('page-loaded');
                console.log('页面加载完成');
            },
            scrollListener() {
                let scrollTop = this.pdfDom.scrollTop;
                this.$emit('on-pdfScroll', scrollTop)
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
    }
</style>
