import http from '@/libs/http.request'

export const getAllPublicCourseware = () => {
    return http.get('/courseware/public')
};