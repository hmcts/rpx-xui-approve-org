import { errorInterceptor } from './interceptors'

fdescribe('interceptor', () => {

    it('Should not throw error', () => {
        const error = {}
        errorInterceptor(error)
    })
})
