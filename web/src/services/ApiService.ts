/* eslint @typescript-eslint/no-explicit-any: 0 */
import http from '@/http-common'

class ApiService {
  getMes (): Promise<any> {
    return http.get('/mes')
  }

  getPrivateMes (token: string): Promise<any> {
    return http.get('/private', { headers: { Authorization: 'Bearer ' + token } })
  }
}

export default new ApiService()
