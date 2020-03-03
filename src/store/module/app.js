export default {
    state: {
        menuList: [],
        classCourseware: {}
    },
    mutations: {
        setMenuList(state, list) {
            state.menuList = list;
        },
        setClassCourseware(state, classCourseware) {
            state.classCourseware = classCourseware;
        },
    }
}
