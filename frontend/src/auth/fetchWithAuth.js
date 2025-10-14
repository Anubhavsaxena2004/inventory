export default async function fetchWithAuth(url, options = {}){
  const token = localStorage.getItem('token')
  const headers = options.headers ? {...options.headers} : {}
  if(token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(url, {...options, headers})
  return res
}
