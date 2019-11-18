import http from '@/libs/http.request'

export const login = ({ username, password }) => {
  const data = {
    username,
    password
  };
  return http.post('authenticate', data)
};

export const getUserInfo = () => {
  return http.get('user/identity')
};

export const logout = (token) => {
  return http.request({
    url: 'logout',
    method: 'post'
  })
};
