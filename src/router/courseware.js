import Main from '@/views/main'

export default {
    path: '/courseware',
    name: 'courseware',
    component: Main,
    meta: {},
    children: [
        {
            path: '/public',
            name: 'public',
            meta: {
                title: '课件库',
                icon: 'md-appstore'
            },
            component: () => import('@/views/courseware/publicCourseware.vue')
        }
    ]
}