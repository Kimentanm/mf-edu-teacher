import Main from '@/views/main'

export default {
    path: '/courseware',
    name: 'courseware',
    component: Main,
    meta: {},
    children: [
        {
            path: '/public',
            name: 'publicCourseware',
            meta: {
                title: '课件库',
                icon: 'md-appstore'
            },
            component: () => import('@/views/courseware/publicCourseware.vue')
        },
        {
            path: '/private',
            name: 'privateCourseware',
            meta: {
                title: '课件库',
                icon: 'md-appstore',
                hideInMenu: true
            },
            component: () => import('@/views/courseware/privateCourseware.vue')
        }
    ]
}