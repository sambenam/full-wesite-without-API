const siteData = (() => {
  const fromHeader =
    typeof headerItems !== "undefined" &&
    typeof flattenHeaderItems === "function"
      ? flattenHeaderItems(headerItems)
      : {};

  const fromMain = typeof mainItems !== "undefined" ? mainItems : {};

  console.log("✅ data.js: headerItems keys:", Object.keys(fromHeader));
  console.log("✅ data.js: mainItems keys:", Object.keys(fromMain));

  const merged = {
    ...fromHeader,
    ...fromMain,
  };

  return typeof applyContentOverrides === "function"
    ? applyContentOverrides(merged)
    : merged;
})();

console.log("📦 siteData نهایی شامل این دسته‌هاست:", Object.keys(siteData));
