import http from '@/libs/http.request'

export const getClassInfo = (id) => {
    return http.get('/class/room/' + id)
};