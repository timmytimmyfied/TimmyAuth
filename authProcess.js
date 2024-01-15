const { Authflow, Titles } = require('prismarine-auth')
const username = process.argv[2];
const cacheDir = 'random';

const doAuth = async () => {
  const flow = new Authflow(username, cacheDir, { authTitle: Titles.MinecraftJava, deviceType: 'Win32', flow: 'sisu' })
  const response = await flow.getMinecraftJavaToken({ fetchEntitlements: true, fetchProfile: true, fetchCertificates: true });
  
  console.log(response)
}

doAuth()
