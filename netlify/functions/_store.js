const { getStore } = require("@netlify/blobs");

function createStore(name) {
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.BLOBS_SITE_ID;
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.BLOBS_TOKEN;

  if (siteID && token) {
    return getStore(name, { siteID, token });
  }

  return getStore(name);
}

function wrapBlobError(error) {
  const message = String(error?.message || "");
  if (message.includes("Netlify Blobs")) {
    return new Error(
      "Netlify Blobs فعال نیست. آن را در داشبورد Netlify بخش Data فعال کنید یا متغیرهای NETLIFY_BLOBS_SITE_ID و NETLIFY_BLOBS_TOKEN را تنظیم کنید."
    );
  }
  return error;
}

module.exports = {
  createStore,
  wrapBlobError,
};
