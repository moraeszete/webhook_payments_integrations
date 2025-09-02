const dbConn = require('../database/connections')

module.exports = {
  getServer: async ({ code, db, modeServer}) => {
    let ret
    const pool = await dbConn.createTcpPool()
    const query = `
      SELECT * FROM ${db}
      WHERE code = '${code}'
      AND mode = '${modeServer}'
    `
    try { ret = await pool.query(query) }
    catch (e) {
    }
    await pool.end()
    return ret[0]
  },
  getServersFromMasterServer: async ({ project, serverName, mode}) => {
    let ret
    const pool = await dbConn.createTcpPoolMasterServer()
    const query = `
      SELECT iabm.ip
      FROM ip_adresses_by_mode iabm
      WHERE iabm.mode = '${mode}'
      AND is_active = 1;

      SELECT s.port
      FROM projects p
      JOIN servers s ON s.project_id = p.id
      WHERE p.is_active = 1
      AND s.is_active = 1
      AND p.name = '${project}'
      AND s.name = '${serverName}';
    `
    try { ret = await pool.query(query) }
    catch (e) {
      //console.log('erro', e)
    }
    await pool.end()
    const ip = {
      ip_address: ret[0][0].ip,
      port: ret[1][0].port
    }
    return ip
  },
  getMasterServerByName: async ({ serverName, mode }) => {
    let ret
    const pool = await dbConn.createTcpPoolMasterServer()
    const query = `
      SELECT iabm.ip
      FROM ip_adresses_by_mode iabm
      WHERE iabm.mode = '${mode}'
      AND is_active = 1;

      SELECT c.port
      FROM config c
      WHERE c.is_active = 1
      AND c.name = '${serverName}';
    `
    try { ret = await pool.query(query) }
    catch (e) {
    }
    await pool.end()
    const ip = {
      ip_address: ret[0][0].ip,
      port: ret[1][0].port
    }
    return ip
  }
}