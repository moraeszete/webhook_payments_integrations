"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
let mongoDb = process.env.MONGO_DATABASE;
function connect() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        redis = new ioredis_1.default({
            host: (_b = (_a = global.redisConfig) === null || _a === void 0 ? void 0 : _a.host) !== null && _b !== void 0 ? _b : '100.64.92.6',
            port: (_d = (_c = global.redisConfig) === null || _c === void 0 ? void 0 : _c.port) !== null && _d !== void 0 ? _d : '6379',
            username: (_f = (_e = global.redisConfig) === null || _e === void 0 ? void 0 : _e.username) !== null && _f !== void 0 ? _f : 'b3dev',
            password: (_h = (_g = global.redisConfig) === null || _g === void 0 ? void 0 : _g.password) !== null && _h !== void 0 ? _h : 'B3dev@tiago'
        });
        try {
            const prom = yield redis.select((_j = global.configs) === null || _j === void 0 ? void 0 : _j.redisDbNumber);
            // O redis.options.db não atualiza logo depois de selecionar
            // porem se prom === 'OK' o redis connectou no banco corretamente
            if (prom === 'OK')
                console.log(`Redis on: ${redis.options.host}:${redis.options.port}[db${global.configs.redisDbNumber}]`);
        }
        catch (error) {
            console.log('Error selecting Redis:', error.message);
        }
    });
}
connect();
exports.default = {
    createKey: (path_1, ...args_1) => __awaiter(void 0, [path_1, ...args_1], void 0, function* (path, parameters = {}) {
        path = path.replace(/\//g, ':');
        // 'process.env.MONGO_DATABASE'
        const prefix = `${mongoDb}:${path.replace(/:/g, ':')}`;
        // Object entries retorna um array de hashes [["key1", "value1"], ["key2", "value2"]]
        const parameterParts = Object.entries(parameters).map(([key, value]) => `${key}_${value}`);
        // map itera o array de fora, e [key, value] é o destructuring do array 
        // é como falar const [key, value] = ["key1", "value1"], pois estamos rodando um array de arrays
        // [0, 1] = ["key1", "value1"], oq é key === 'key1 === indice 0
        return `${prefix}:${parameterParts.join(':')}`;
    }),
    setKey: (key, value, expiration) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redis)
            return false;
        // Expiração em segundos, se não for passado e se o valor for negativo, não seta a expiração
        try {
            let result;
            if (expiration && expiration > 0) {
                result = yield redis.set(key, JSON.stringify(value), 'EX', expiration);
                return result === 'OK';
            }
            result = yield redis.set(key, JSON.stringify(value), 'NX');
            return result === 'OK';
        }
        catch (error) {
            console.log('Error setKey on Redis:', error.message);
            return false;
        }
        // Se o valor for 0 ou menor, não seta a expiração
    }),
    getKey: (key) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redis)
            return false;
        // Se o valor não existir, o redis retorna nill, então não precisa fazer nada
        try {
            const value = yield redis.get(key);
            return value ? JSON.parse(value) : false;
        }
        catch (error) {
            console.log('Error getKey on Redis:', error.message);
            return false;
        }
    }),
    delKey: (key) => __awaiter(void 0, void 0, void 0, function* () {
        //ou retorna true para 1 key ou o numero para um array de keys
        if (!redis)
            return false;
        // Se for um array, deleta todos os valores do array del pode receber array
        try {
            if (Array.isArray(key)) {
                if (key.length > 1) {
                    const result = yield redis.del(key);
                    return { delete: true, deleted: Number(result), expected: Number(key.length) };
                }
                else if (key.length === 1) {
                    key = key[0];
                }
            }
            const result = yield redis.del(key);
            return { delete: true, deleted: Number(result), expected: Number(key.length) };
        }
        catch (error) {
            console.log('Error delKey array on Redis:', error.message);
            return false;
            // Se for um array de 1 elemento, deleta o valor
        }
    }),
    clearKeysByPath: (path) => __awaiter(void 0, void 0, void 0, function* () {
        if (!redis)
            return null;
        // Se o prefixo não existir, não faz nada
        try {
            path = path.replace(/\//g, ':');
            const searchString = `${mongoDb}:${path}:*`;
            const keys = yield redis.keys(searchString);
            if (keys.length > 0) {
                const result = yield redis.del(keys);
                return { delete: true, deleted: Number(result), expected: Number(keys.length) };
            }
            console.log(`Key not found in Redis: ${searchString}`);
            return false;
        }
        catch (error) {
            console.log('Error clearPrefixKeys on Redis:', error.message);
            return false;
        }
    })
};
