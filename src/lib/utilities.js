const { writeJSON, readJSON } = require("fs-extra")
const {join}= require("path")
const usersPath = join(__dirname, "../users/users.json")

const readDB = async filePath => {
  try {
    const fileJSON = await readJSON(filePath)
    return fileJSON
  } catch (error) {
    throw new Error(error)
  }
}

const writeDB = async (filePath, data) => {
  //writing on disk
  try {
    await writeJSON(filePath, data)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = {
  readDB,
  writeDB,
  getUsers: async () => readDB(usersPath),
  writeUsers: async userData => writeDB(usersPath, userData),
}

