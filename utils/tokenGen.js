const jwt = require("jsonwebtoken");
const { Timestamps } = require("./timestamps.js");

/**
 * Token Generator Class
 * Usage: const tokenResult = await TokenGenerator.create(options, res);
 * Token is generated automatically and saved to database
 */
module.exports = class TokenGenerator {
  constructor(options) {
    this.secret_jwt = process.env.JWT_SECRET || "";
    this.algorithm_jwt = process.env.JWT_ALGORITHM || "";
    this.options = options;

    if (!this.secret_jwt || !this.algorithm_jwt) {
      throw new Error("JWT configuration missing in environment variables");
    }
  }

  /**
   * Static factory method to create instance and generate token
   */
  static async create(options, res) {
    const instance = new TokenGenerator(options);
    return await instance.generateAndSetToken(res);
  }

  /**
   * Generates JWT token, saves to database, and sets cookie
   */
  async generateAndSetToken(res) {
    try {
      const token = jwt.sign(
        {
          userId: this.options.userId,
          isActive: this.options.isActive,
          permissionInfo: this.options.permissionInfo
        },
        this.secret_jwt,
        {
          expiresIn: this.options.rememberMe ? '30d' : '1d',
          algorithm: this.algorithm_jwt
        }
      );

      // Always save to database
      await this.saveToDatabase(token);

      // Set cookie
      this.setTokenCookie(res, token);

      return { token, success: true };

    } catch (error) {
      console.error('Token generation error:', error);
      return {
        token: "",
        success: false,
        message: "Error generating token"
      };
    }
  }

  /**
   * Saves token to database
   */
  async saveToDatabase(token) {
    const collTokens = await global.mongo.collection("tokens");

    await collTokens.insertOne(
      {
        userId: this.options.userId,
        token: token,
        createdAt: new Timestamps(),
        isActive: true
      },
    );
  }

  /**
   * Sets token cookie
   */
  setTokenCookie(res, token) {
    const isDev = process.env.NODE_ENV !== "prod";

    // Configuração baseada no ambiente
    const cookieConfig = {
      httpOnly: true,
      maxAge: this.options.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      path: "/",
      // Em desenvolvimento, usar configurações permissivas
      sameSite: isDev ? "lax" : "none",
      secure: !isDev, // false para HTTP local, true para HTTPS produção
      domain: undefined // Nunca definir domain em desenvolvimento
    }
    
    // console.log('Cookie config:', cookieConfig);
    res.cookie("token", token, cookieConfig);
  }

  /**
   * Verifies if a JWT token is valid then return if needed 
   */
  static async verifyToken(token, returnToken) {
    try {
      const secret_jwt = process.env.SECRET_KEY ?? "";
      const algorithm_jwt = process.env.JWT_ALGORITHM ?? "HS256";

      if (!secret_jwt || !algorithm_jwt) return false;

      if (!token) return false;
      const verified = jwt.verify(
        token,
        secret_jwt,
        { algorithms: [algorithm_jwt] }
      );

      if (typeof verified !== "string" && verified.exp && verified.exp * 1000 < Date.now()) {
        return false;
      }
      if (returnToken) {
        return verified;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
}
