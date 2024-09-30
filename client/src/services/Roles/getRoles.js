export const getRoles = async () => {

  const res = await fetch('/api/role/get')
  const data = await res.json()

  if (data.success === false) {
    return {}
  }

  const roles = {}

  data.roles.forEach(role => {

    if (role.name == 'Supervisor') {

      roles['supervisorRole'] = role
    }

    if (role.name == 'Vendedor') {

      roles['sellerRole'] = role
    }

    if (role.name == 'Gerente') {

      roles['managerRole'] = role
    }

  });

  return roles
}