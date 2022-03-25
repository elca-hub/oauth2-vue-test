/* eslint @typescript-eslint/no-explicit-any: 0 */
import http from '@/http-common'

class ApiService {
  getMes (): Promise<any> {
    return http.get('/api/mes')
  }
}

export default new ApiService()
