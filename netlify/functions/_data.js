const { createStore, wrapBlobError } = require("./_store");

function getDataStore() {
  return createStore("panel-data");
}

async function readJson(key, fallback) {
  try {
    const store = getDataStore();
    const value = await store.get(key, { type: "json" });
    if (value === null || value === undefined) {
      return fallback;
    }
    return value;
  } catch (error) {
    throw wrapBlobError(error);
  }
}

async function writeJson(key, value) {
  try {
    const store = getDataStore();
    await store.set(key, value);
  } catch (error) {
    throw wrapBlobError(error);
  }
}

module.exports = {
  readJson,
  writeJson,
};
