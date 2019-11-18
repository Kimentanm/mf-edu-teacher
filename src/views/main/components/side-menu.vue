<template>
    <div class="side-menu">
        <Menu active-name="home" theme="light" width="auto" :class="menuitemClasses" @on-select="handleSelect">
            <MenuItem v-for="(item, index) in menuList" :key="index" :name="item.name">
                <Icon :type="item.icon" />
                <span>{{item.meta.title}}</span>
            </MenuItem>
        </Menu>
    </div>
</template>

<script>
    export default {
        name: "side-menu",
        components: {},
        props: {
            menuList: {
                type: Array,
                required: true
            },
            isCollapsed: Boolean
        },
        data() {
            return {}
        },
        watch: {},
        computed: {
            menuitemClasses: function () {
                return [
                    'menu-item',
                    this.isCollapsed ? 'collapsed-menu' : ''
                ]
            },
        },
        methods: {
            handleSelect(name) {
                this.$router.push({
                    name: name
                })
            }
        },
        created() {
        }
    }
</script>

<style lang="less">
    .side-menu {

        .ivu-menu-item {

            span {
                text-align: center;
            }
        }

    }
</style>