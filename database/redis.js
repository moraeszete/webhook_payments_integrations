const Redis = require("ioredis").Redis;
let redis;
let mongoDb = process.env.MONGO_DATABASE;

async function connect () {
  redis = new Redis(
    {
      host: global.redisConfig?.host || '100.64.92.6',
      port: global.redisConfig?.port || '6379',
      username: global.redisConfig?.username || 'b3dev',
      password: global.redisConfig?.password || 'B3dev@tiago'
    }
  )

  try {
    const prom = await redis.select(global.configs.redisDbNumber)
    // O redis.options.db não atualiza logo depois de selecionar
    // porem se prom === 'OK' o redis connectou no banco corretamente
    if(prom === 'OK')return console.warn(`Redis on: ${redis.options.host}:${redis.options.port}[db${global.configs.redisDbNumber}]`)
  } catch (error) {
    return console.log('Error selecting Redis:', error.message)    
  }
}

connect()

const redisMethods = {
    createKey: async (path, parameters = {}) =>{
      path = path.replace(/\//g, ':')
      const prefix = `${mongoDb}${path}`
      // Object entries retorna um array de hashes [["key1", "value1"], ["key2", "value2"]]
      const parameterParts = Object.entries(parameters).map(([key, value]) => `${key}_${value}`)
      // map itera o array de fora, e [key, value] é o destructuring do array 
      // é como falar const [key, value] = ["key1", "value1"], pois estamos rodando um array de arrays
      // [0, 1] = ["key1", "value1"], oq é key === 'key1 === indice 0
      return `${prefix}:${parameterParts.join(':')}`
    },
    setKey : async (key, value, expiration) =>{
      if(!redis) return null
      value = await JSON.stringify(value)
      // Expiração em segundos, se não for passado e se o valor for negativo
      // não seta a expiração
      try {
        if(expiration && expiration > 0){ 
          const result = await redis.set(key, value, 'EX', expiration, "NX")
          return result === 'OK' 
        }
        const result = await redis.set(key, value, 'NX') 
        return result === 'OK'
      } catch (error) {
        console.error('Error setKey on Redis:', error.message)
        return false
      }
    },
    getKey : async (key) => {
      console.log(key, 'key')
      if(!redis) return null
      // Se o valor não existir, o redis retorna nill, então não precisa fazer nada
      try {
        const value = await redis.get(key)
        if(value) return JSON.parse(value)

        return null
      } catch (error) {
        console.error('Error getKey on Redis:', error.message)
        return false
      }
    },
    delKey : async (key) => {
      //ou retorna true para 1 key ou o numero para um array de keys
      if(!redis) return null
      // Se for um array, deleta todos os valores do array del pode receber array
      try {
        if(Array.isArray(key)){
          if(key.length > 1){
            const result = await redis.del(key) 
            return { delete: true, deleted: Number(result), expected: Number(key.length) }
          } else if(key.length === 1){
            key = key[0]
          }
        }
        const result = await redis.del(key)
        return { delete: true, deleted: Number(result), expected: Number(key.length) }
      } catch (error) {
        console.error('Error delKey array on Redis:', error.message)
        return  { delete: false, deleted: 0, expected: 0 }
        // Se for um array de 1 elemento, deleta o valor
      }
    },
    clearKeysByPath: async (path) =>{
      if(!redis) return null
      // Se o prefixo não existir, não faz nada
      try {
        path = path.replace(/\//g, ':')
        const searchString = `${mongoDb}${path}:*`
        const keys = await redis.keys(searchString)
        if(keys.length > 0){
          const result = await redis.del(keys)
          return { delete: true, deleted: Number(result), expected: Number(keys.length) }
        }
        console.log(`Key not found in Redis: ${searchString}`)
        return false
      } catch (error) {
        console.error('Error clearPrefixKeys on Redis:', error.message)
        return false
      }
    },
    parseKey: async function(path, parameters = {}, expiration, value) {
      //retornar false se o valor já existir, ou se não conseguir criar a chave
      if(!redis) return null
      try{
        const key = await this.createKey(path, parameters);
        let keyValue = await this.getKey(key)
        
        if (keyValue !== null) {
          console.warn("Chave já existente!")
          return { error: false, keyValue: true, created: false }
        }
        
        const settedKey = await this.setKey(key, value, expiration); 
        if (!settedKey) {
          console.warn("Erro ao criar chave!")
          return { error: true, keyValue: false, created: false }
        }
        return { error: false, keyValue: false, created: true }
      } catch (error) {
        console.error('Error parseKey on Redis:', error.message)
        return { error: true, keyValue: false, created: false }
      }
    }
  }
  
  module.exports = redisMethods