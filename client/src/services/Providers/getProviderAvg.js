export const getProviderAvg = async ({providerId}) => {

    const res = await fetch('/api/provider/get-provider-avg/' + providerId)
    const data = await res.json()
  
    if(data.success === false) {
  
      console.log(data.message)
      return 0
    }
  
    return data.providerAvg
  }