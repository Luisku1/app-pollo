export const getRoles = async () => {

  const res = await fetch('/api/role/get')
  const data = await res.json()

  if (data.success === false) {
    return {}
  }

  const roles = {}

  data.roles.forEach(role => {

    if (role.name === 'Supervisor')
      roles['supervisor'] = role
    if (role.name === 'Vendedor')
      roles['seller'] = role
    if (role.name === 'Contralor')
      roles['controller'] = role
    if (role.name === 'Gerente')
      roles['manager'] = role
    if (role.name === 'Sudo')
      roles['sudo'] = role
  });

  return roles
}