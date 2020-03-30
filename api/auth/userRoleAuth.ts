export function havePrdAdminRole(userData) {
    console.log('userData', userData.indexOf('prd-admin'))
    return userData.indexOf('prd-admin') !== -1
}
