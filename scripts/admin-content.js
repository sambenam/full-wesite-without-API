let contentEditorState = {
  itemId: null,
  blocks: [],
  downloads: [],
};

let contentAdminInitialized = false;

function populateCategorySelect() {
  const select = document.getElementById("newItemCategory");
  if (!select) return;

  if (typeof siteData === "undefined") {
    select.innerHTML = '<option value="">اطلاعات لود نشده است</option>';
    return;
  }

  const groups = [
    {
      title: "🎓 منوهای هدر: بخش دانشجویان و کنکور",
      categories: [
        "diploma",
        "associate_degree",
        "bachelor",
        "master",
        "phd",
        "konkur1",
        "konkur2",
        "konkur3",
        "Enterpreneurship_projects",
        "Enternship-projects",
        "Financial-project",
      ],
    },
    {
      title: "📂 منوهای هدر: فایل‌های دانلود حسابداری",
      categories: ["power_point", "Exel", "Word"],
    },
    {
      title: "📝 منوهای هدر: مقالات، ویدیوها و بخشنامه‌ها",
      categories: [
        "accounting_article",
        "software_training",
        "standards",
        "accounting_circulars",
        "videos",
      ],
    },
    {
      title: "🏠 سکشن‌های صفحه اصلی",
      categories: [
        "beginner",
        "intermediate",
        "advanced",
        "popularCourses",
        "newCourses",
        "specials",
        "articles",
        "exams",
      ],
    },
  ];

  let htmlOptions = "";
  groups.forEach((group) => {
    htmlOptions += `<optgroup label="${group.title}">`;
    group.categories.forEach((catKey) => {
      const category = siteData[catKey];
      if (category) {
        htmlOptions += `<option value="${catKey}">${category.title} (${catKey})</option>`;
      }
    });
    htmlOptions += `</optgroup>`;
  });

  select.innerHTML = htmlOptions;
}

function deleteContentItem(itemId) {
  if (confirm("آیا از حذف این آیتم اطمینان دارید؟ این عمل قابل بازگشت نیست.")) {
    if (typeof addDeletedItemId === "function") {
      addDeletedItemId(itemId);
    }
    if (typeof removeContentOverride === "function") {
      removeContentOverride(itemId);
    }
    if (typeof removeAddedItem === "function") {
      removeAddedItem(itemId);
    }

    if (
      typeof applyContentOverrides === "function" &&
      typeof siteData !== "undefined"
    ) {
      applyContentOverrides(siteData);
    }

    showToast("آیتم با موفقیت حذف شد.", "success");
    renderContentTable();
  }
}

function initContentAdmin() {
  if (contentAdminInitialized) {
    return;
  }

  contentAdminInitialized = true;
  const searchInput = document.getElementById("contentTableSearch");
  const form = document.getElementById("editContentForm");

  const addNewBtn = document.getElementById("addNewContentItemBtn");
  const addNewForm = document.getElementById("addNewItemForm");

  if (searchInput) {
    searchInput.addEventListener("input", function (event) {
      renderContentTable();
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      saveEditedContent();
    });
  }

  if (addNewBtn) {
    addNewBtn.addEventListener("click", function () {
      populateCategorySelect();
      openModal("addNewItemModal");
    });
  }

  if (addNewForm) {
    addNewForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const id = document.getElementById("newItemId").value.trim();
      const catKey = document.getElementById("newItemCategory").value;
      const title = document.getElementById("newItemTitle").value.trim();
      const image =
        document.getElementById("newItemImage").value.trim() ||
        "../images/ravin.png";
      const excerpt = document.getElementById("newItemExcerpt").value.trim();

      if (!id || !catKey || !title) {
        showToast("لطفاً فیلدهای ضروری را پر کنید.", "error");
        return;
      }

      // Check for duplicates
      if (typeof findSiteItem === "function" && findSiteItem(id)) {
        showToast("خطا: آیتمی با این شناسه (ID) از قبل وجود دارد.", "error");
        return;
      }

      const newItem = {
        id: id,
        title: title,
        categoryKey: catKey,
        image: image,
        excerpt: excerpt,
        content: {
          blocks: [],
          video: null,
          downloads: [],
        },
      };

      if (typeof saveAddedItem === "function") {
        saveAddedItem(newItem);
      }

      if (
        typeof applyContentOverrides === "function" &&
        typeof siteData !== "undefined"
      ) {
        applyContentOverrides(siteData);
      }

      closeModal("addNewItemModal");
      showToast("آیتم جدید با موفقیت اضافه شد.", "success");
      addNewForm.reset();
      renderContentTable();
    });
  }

  const resetButton = document.getElementById("resetContentBtn");
  if (resetButton) {
    resetButton.addEventListener("click", resetEditedContent);
  }

  document.querySelectorAll("[data-add-block]").forEach(function (button) {
    button.addEventListener("click", function () {
      addContentBlock(button.getAttribute("data-add-block"));
    });
  });

  const addDownloadBtn = document.getElementById("addDownloadBtn");
  if (addDownloadBtn) {
    addDownloadBtn.addEventListener("click", addDownloadRow);
  }

  const videoEnabled = document.getElementById("contentVideoEnabled");
  if (videoEnabled) {
    videoEnabled.addEventListener("change", toggleVideoFields);
  }

  // Toggle price visibility in content editor modal
  const contentIsPaid = document.getElementById("contentIsPaid");
  const contentPriceContainer = document.getElementById("contentPriceContainer");
  const contentItemPrice = document.getElementById("contentItemPrice");

  if (contentIsPaid && contentPriceContainer) {
    contentIsPaid.addEventListener("change", function () {
      if (contentIsPaid.checked) {
        contentPriceContainer.style.display = "flex";
        if (contentItemPrice) {
          contentItemPrice.required = true;
          contentItemPrice.value = "50000";
        }
      } else {
        contentPriceContainer.style.display = "none";
        if (contentItemPrice) {
          contentItemPrice.required = false;
          contentItemPrice.value = "0";
        }
      }
    });
  }

  renderContentTable();
}

function renderContentTable() {
  const container = document.getElementById("groupedContentContainer");
  if (!container) {
    return;
  }

  try {
    if (
      typeof getAllSiteItems !== "function" ||
      typeof siteData === "undefined"
    ) {
      container.innerHTML =
        '<div class="alert alert-error">اطلاعات محتوا بارگذاری نشده است. صفحه را دوباره بارگذاری کنید.</div>';
      return;
    }

    const searchQuery = document.getElementById("contentTableSearch")
      ? document.getElementById("contentTableSearch").value.trim().toLowerCase()
      : "";

    // 1. Search Mode
    if (searchQuery) {
      const items = getAllSiteItems().filter(function (row) {
        return (
          String(row.id).toLowerCase().includes(searchQuery) ||
          String(row.title).toLowerCase().includes(searchQuery) ||
          String(row.categoryTitle).toLowerCase().includes(searchQuery)
        );
      });

      if (!items.length) {
        container.innerHTML =
          '<div style="text-align: center; padding: 2rem; color: var(--text-muted);">نتیجه‌ای برای جستجوی شما پیدا نشد.</div>';
        return;
      }

      container.innerHTML = `
        <div class="glass-card" style="margin-top: 1rem;">
          <div class="card-header"><h3>نتایج جستجو (${items.length} آیتم)</h3></div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>عنوان</th>
                  <th>دسته</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(function (row) {
                    const statusBadge = row.hasOverride
                      ? '<span class="status success">ذخیره ادمین</span>'
                      : row.hasBlocks
                        ? '<span class="status pending">بلوک‌بندی</span>'
                        : '<span class="status cancelled">پیش‌فرض</span>';
                    return `
                    <tr>
                      <td><code>${row.id}</code></td>
                      <td>${row.title}</td>
                      <td>${row.categoryTitle}</td>
                      <td>${statusBadge}</td>
                      <td style="display: flex; gap: 0.5rem; align-items: center;">
                        <button type="button" class="btn-secondary content-edit-btn" data-item-id="${row.id}" style="padding: 6px 12px; font-size: 13px; cursor: pointer;">ویرایش محتوا</button>
                        <button type="button" class="btn-secondary content-delete-btn" data-item-id="${row.id}" style="padding: 6px 12px; font-size: 13px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); cursor: pointer;">حذف</button>
                      </td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;

      container
        .querySelectorAll(".content-edit-btn")
        .forEach(function (button) {
          button.addEventListener("click", function () {
            openContentEditor(button.getAttribute("data-item-id"));
          });
        });
      container
        .querySelectorAll(".content-delete-btn")
        .forEach(function (button) {
          button.addEventListener("click", function () {
            deleteContentItem(button.getAttribute("data-item-id"));
          });
        });
      return;
    }

    // 2. Normal Grouped Accordion Mode
    const groups = [
      {
        id: "group-students",
        title: "🎓 منوهای هدر: برای دانشجویان",
        categories: [
          "diploma",
          "associate_degree",
          "bachelor",
          "master",
          "phd",
          "konkur1",
          "konkur2",
          "konkur3",
          "Enterpreneurship_projects",
          "Enternship-projects",
          "Financial-project",
        ],
      },
      {
        id: "group-files",
        title: "📂 منوهای هدر: فایل‌های حسابداری",
        categories: ["power_point", "Exel", "Word"],
      },
      {
        id: "group-others",
        title: "📝 منوهای هدر: مقالات، ویدیوها و بخشنامه‌ها",
        categories: [
          "accounting_article",
          "software_training",
          "standards",
          "accounting_circulars",
          "videos",
        ],
      },
      {
        id: "group-main",
        title: "🏠 سکشن‌های صفحه اصلی",
        categories: [
          "beginner",
          "intermediate",
          "advanced",
          "popularCourses",
          "newCourses",
          "specials",
          "articles",
          "exams",
        ],
      },
    ];

    const allCategoriesInGroups = [];
    groups.forEach(function (g) {
      if (Array.isArray(g.categories)) {
        g.categories.forEach(function (c) {
          allCategoriesInGroups.push(c);
        });
      }
    });

    const fallbackCategories = [];
    Object.keys(siteData).forEach(function (catKey) {
      if (allCategoriesInGroups.indexOf(catKey) === -1) {
        fallbackCategories.push(catKey);
      }
    });

    if (fallbackCategories.length > 0) {
      groups.push({
        id: "group-fallback",
        title: "⚙️ سایر دسته‌بندی‌های سایت",
        categories: fallbackCategories,
      });
    }

    let htmlContent = "";

    groups.forEach(function (group, groupIdx) {
      let groupCategoriesHtml = "";

      group.categories.forEach(function (catKey) {
        const category = siteData[catKey];
        if (!category) return;

        const categoryItems = category.items || [];

        let itemsHtml = "";
        if (categoryItems.length === 0) {
          itemsHtml = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 1rem;">هیچ آیتمی در این دسته وجود ندارد.</td></tr>`;
        } else {
          itemsHtml = categoryItems
            .map(function (item) {
              const hasOverride = Boolean(getContentOverride(item.id));
              const hasBlocks =
                typeof getContentBlocks === "function"
                  ? getContentBlocks(item).length > 0
                  : Boolean(item.content);
              const statusBadge = hasOverride
                ? '<span class="status success">ذخیره ادمین</span>'
                : hasBlocks
                  ? '<span class="status pending">بلوک‌بندی</span>'
                  : '<span class="status cancelled">پیش‌فرض</span>';

              return `
              <tr>
                <td><code>${item.id}</code></td>
                <td><img src="${item.image || "../images/ravin.png"}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);" /></td>
                <td style="font-weight: 500;">${item.title}</td>
                <td>${statusBadge}</td>
                <td style="display: flex; gap: 0.5rem; align-items: center;">
                  <button type="button" class="btn-secondary content-edit-btn" data-item-id="${item.id}" style="padding: 6px 12px; font-size: 13px; cursor: pointer;">ویرایش محتوا</button>
                  <button type="button" class="btn-secondary content-delete-btn" data-item-id="${item.id}" style="padding: 6px 12px; font-size: 13px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); cursor: pointer;">حذف</button>
                </td>
              </tr>
            `;
            })
            .join("");
        }

        groupCategoriesHtml += `
          <div class="admin-category-box" >
            <h4 >
              <i class="fa-solid fa-folder-open"></i>
              ${category.title}
              <span style="font-size: 11px; font-weight: normal; color: var(--text-muted); direction: ltr;">(${catKey})</span>
            </h4>
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 15%;color: #0000dd;">شناسه</th>
                    <th style="width: 10%;color: #0000dd;">تصویر</th>
                    <th style="width: 50%;color: #0000dd;">عنوان آیتم</th>
                    <th style="width: 13%;color: #0000dd;">وضعیت</th>
                    <th style="width: 12%;color: #0000dd;">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>
          </div>
        `;
      });

      const isOpen = "open";

      htmlContent += `
        <details class="admin-group-details" ${isOpen}>
          <summary >
            <span>${group.title}</span>
            <i class="fa-solid fa-chevron-down" style="font-size: 12px; transition: transform 0.3s;"></i>
          </summary>
          <div class="admin-group-content" style="padding: 1.25rem; border-top: 1px solid rgb(0, 0, 0, 0.4);">
            ${groupCategoriesHtml}
          </div>
        </details>
      `;
    });

    container.innerHTML = htmlContent;

    container.querySelectorAll("details").forEach(function (det) {
      const summary = det.querySelector("summary");
      const icon = summary.querySelector("i");
      if (det.open && icon) {
        icon.style.transform = "rotate(180deg)";
      }
      if (summary && icon) {
        summary.addEventListener("click", function () {
          setTimeout(function () {
            icon.style.transform = det.open ? "rotate(180deg)" : "rotate(0deg)";
          }, 50);
        });
      }
    });

    container.querySelectorAll(".content-edit-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        openContentEditor(button.getAttribute("data-item-id"));
      });
    });
    container
      .querySelectorAll(".content-delete-btn")
      .forEach(function (button) {
        button.addEventListener("click", function () {
          deleteContentItem(button.getAttribute("data-item-id"));
        });
      });
  } catch (err) {
    console.error("Error inside renderContentTable:", err);
    container.innerHTML = `<div class="alert alert-error" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px;">خطا در لود دسته‌بندی‌ها: ${err.message}</div>`;
  }
}

function filterContentTable(query) {
  renderContentTable();
}

function openContentEditor(itemId) {
  const found = findSiteItem(itemId);
  if (!found) {
    showToast("آیتم پیدا نشد", "error");
    return;
  }

  const item = found.item;
  contentEditorState.itemId = itemId;
  contentEditorState.blocks = getContentBlocks(item);
  contentEditorState.downloads = getEditableDownloads(item);

  document.getElementById("editContentItemId").value = itemId;
  const titleInput = document.getElementById("editContentTitleInput");
  if (titleInput) {
    titleInput.value = item.title || "";
  }

  const imageInput = document.getElementById("editContentImageInput");
  if (imageInput) {
    imageInput.value = item.image || "";
  }
  document.getElementById("editContentCategory").textContent =
    found.categoryTitle;
  document.getElementById("editContentExcerpt").value = item.excerpt || "";

  const content =
    item.content && typeof item.content === "object" ? item.content : {};
  const video = content.video || {};
  const videoEnabled = Boolean(video.enabled && video.url);

  document.getElementById("contentVideoEnabled").checked = videoEnabled;
  document.getElementById("contentVideoUrl").value = video.url || "";
  document.getElementById("contentVideoProvider").value =
    video.provider || "youtube";
  document.getElementById("contentVideoTitle").value = video.title || "";

  renderBlocksEditor();
  renderDownloadsEditor();
  toggleVideoFields();

  // Load associated product price to set isPaid checkbox and price input
  const productsRaw = localStorage.getItem("irHesabdarProducts");
  let productPrice = 0;
  if (productsRaw) {
    try {
      const prods = JSON.parse(productsRaw);
      if (Array.isArray(prods)) {
        const associatedProd = prods.find(function(p) { return String(p.id) === String(itemId); });
        if (associatedProd) {
          productPrice = Number(associatedProd.price) || 0;
        }
      }
    } catch(e) {}
  }

  const contentIsPaidInput = document.getElementById("contentIsPaid");
  const contentPriceContainerDiv = document.getElementById("contentPriceContainer");
  const contentItemPriceInput = document.getElementById("contentItemPrice");

  if (contentIsPaidInput && contentPriceContainerDiv && contentItemPriceInput) {
    if (productPrice > 0) {
      contentIsPaidInput.checked = true;
      contentPriceContainerDiv.style.display = "flex";
      contentItemPriceInput.value = productPrice;
      contentItemPriceInput.required = true;
    } else {
      contentIsPaidInput.checked = false;
      contentPriceContainerDiv.style.display = "none";
      contentItemPriceInput.value = "0";
      contentItemPriceInput.required = false;
    }
  }

  openModal("editContentModal");
}

function getEditableDownloads(item) {
  const content =
    item.content && typeof item.content === "object" ? item.content : {};
  const downloads = content.downloads || item.downloads || [];

  if (!Array.isArray(downloads)) {
    return [];
  }

  return downloads.map(function (file, index) {
    return {
      id: file.id || "download-" + (index + 1),
      title: file.title || "",
      url: file.url || "",
      type: file.type || "file",
      size: file.size || "",
    };
  });
}

function renderBlocksEditor() {
  const container = document.getElementById("contentBlocksEditor");
  if (!container) {
    return;
  }

  if (!contentEditorState.blocks.length) {
    container.innerHTML =
      '<p class="content-editor_empty">هنوز بلوکی اضافه نشده. از دکمه‌های بالا استفاده کنید.</p>';
    return;
  }

  container.innerHTML = contentEditorState.blocks
    .map(function (block, index) {
      return buildBlockEditorHtml(block, index);
    })
    .join("");

  bindBlockEditorEvents(container);
}

function buildBlockEditorHtml(block, index) {
  const labels = {
    heading: "عنوان",
    paragraph: "پاراگراف",
    list: "لیست",
    "ordered-list": "لیست شماره‌دار",
    quote: "نقل‌قول",
    link: "لینک",
    image: "تصویر",
    divider: "جداکننده",
    html: "HTML سفارشی",
  };

  let fields = "";

  if (block.type === "heading") {
    fields =
      "<label>متن عنوان</label>" +
      '<input type="text" class="form-control block-text" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.text || "") +
      '">' +
      '<label style="margin-top:8px">سطح</label>' +
      '<select class="form-control block-level" data-index="' +
      index +
      '">' +
      [1, 2, 3, 4, 5, 6]
        .map(function (level) {
          return (
            '<option value="' +
            level +
            '"' +
            (block.level === level ? " selected" : "") +
            ">H" +
            level +
            "</option>"
          );
        })
        .join("") +
      "</select>";
  } else if (block.type === "paragraph") {
    fields =
      "<label>متن پاراگراف</label>" +
      '<textarea class="form-control block-text" rows="3" data-index="' +
      index +
      '">' +
      escapeHtml(block.text || "") +
      "</textarea>";
  } else if (block.type === "list" || block.type === "ordered-list") {
    const listValue = (block.items || []).join("\n");
    fields =
      "<label>آیتم‌ها (هر خط یک مورد)</label>" +
      '<textarea class="form-control block-items" rows="4" data-index="' +
      index +
      '">' +
      escapeHtml(listValue) +
      "</textarea>";
  } else if (block.type === "quote") {
    fields =
      "<label>متن نقل‌قول</label>" +
      '<textarea class="form-control block-text" rows="3" data-index="' +
      index +
      '">' +
      escapeHtml(block.text || "") +
      "</textarea>" +
      '<label style="margin-top:8px">منبع یا گوینده (اختیاری)</label>' +
      '<input type="text" class="form-control block-cite" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.cite || "") +
      '">';
  } else if (block.type === "link") {
    fields =
      "<label>متن لینک</label>" +
      '<input type="text" class="form-control block-text" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.text || "") +
      '">' +
      '<label style="margin-top:8px">آدرس لینک</label>' +
      '<input type="text" class="form-control block-url" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.url || "") +
      '">' +
      '<label style="margin-top:8px">نحوه باز شدن</label>' +
      '<select class="form-control block-target" data-index="' +
      index +
      '">' +
      '<option value="_blank"' +
      (block.target !== "_self" ? " selected" : "") +
      ">تب جدید</option>" +
      '<option value="_self"' +
      (block.target === "_self" ? " selected" : "") +
      ">همین صفحه</option>" +
      "</select>";
  } else if (block.type === "image") {
    fields =
      "<label>آدرس تصویر</label>" +
      '<input type="text" class="form-control block-src" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.src || "") +
      '">' +
      '<label style="margin-top:8px">متن جایگزین</label>' +
      '<input type="text" class="form-control block-alt" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.alt || "") +
      '">' +
      '<label style="margin-top:8px">توضیح زیر تصویر (اختیاری)</label>' +
      '<input type="text" class="form-control block-caption" data-index="' +
      index +
      '" value="' +
      escapeAttr(block.caption || "") +
      '">';
  } else if (block.type === "html") {
    fields =
      "<label>کد HTML این بخش</label>" +
      '<textarea class="form-control block-html" rows="7" data-index="' +
      index +
      '" dir="ltr">' +
      escapeHtml(block.html || "") +
      "</textarea>";
  } else if (block.type === "divider") {
    fields =
      '<p class="content-editor_empty">یک خط جداکننده در متن نمایش داده می‌شود.</p>';
  }

  return (
    '<div class="content-block-card" data-block-index="' +
    index +
    '">' +
    '<div class="content-block-card_header">' +
    "<strong>" +
    (labels[block.type] || block.type) +
    "</strong>" +
    '<div class="content-block-card_actions">' +
    '<button type="button" class="btn-secondary block-move-up" data-index="' +
    index +
    '" title="بالا">↑</button>' +
    '<button type="button" class="btn-secondary block-move-down" data-index="' +
    index +
    '" title="پایین">↓</button>' +
    '<button type="button" class="btn-secondary block-delete" data-index="' +
    index +
    '" style="color:var(--danger)">حذف</button>' +
    "</div></div>" +
    fields +
    "</div>"
  );
}

function bindBlockEditorEvents(container) {
  container.querySelectorAll(".block-text").forEach(function (input) {
    input.addEventListener("input", function () {
      const index = Number(input.getAttribute("data-index"));
      contentEditorState.blocks[index].text = input.value;
    });
  });

  container.querySelectorAll(".block-level").forEach(function (select) {
    select.addEventListener("change", function () {
      const index = Number(select.getAttribute("data-index"));
      contentEditorState.blocks[index].level = Number(select.value);
    });
  });

  container.querySelectorAll(".block-items").forEach(function (textarea) {
    textarea.addEventListener("input", function () {
      const index = Number(textarea.getAttribute("data-index"));
      contentEditorState.blocks[index].items = textarea.value
        .split("\n")
        .map(function (line) {
          return line.trim();
        })
        .filter(Boolean);
    });
  });

  container.querySelectorAll(".block-cite").forEach(function (input) {
    input.addEventListener("input", function () {
      const index = Number(input.getAttribute("data-index"));
      contentEditorState.blocks[index].cite = input.value;
    });
  });

  container.querySelectorAll(".block-url").forEach(function (input) {
    input.addEventListener("input", function () {
      const index = Number(input.getAttribute("data-index"));
      contentEditorState.blocks[index].url = input.value;
    });
  });

  container.querySelectorAll(".block-target").forEach(function (select) {
    select.addEventListener("change", function () {
      const index = Number(select.getAttribute("data-index"));
      contentEditorState.blocks[index].target = select.value;
    });
  });

  container.querySelectorAll(".block-src").forEach(function (input) {
    input.addEventListener("input", function () {
      const index = Number(input.getAttribute("data-index"));
      contentEditorState.blocks[index].src = input.value;
    });
  });

  container.querySelectorAll(".block-alt").forEach(function (input) {
    input.addEventListener("input", function () {
      const index = Number(input.getAttribute("data-index"));
      contentEditorState.blocks[index].alt = input.value;
    });
  });

  container.querySelectorAll(".block-caption").forEach(function (input) {
    input.addEventListener("input", function () {
      const index = Number(input.getAttribute("data-index"));
      contentEditorState.blocks[index].caption = input.value;
    });
  });

  container.querySelectorAll(".block-html").forEach(function (textarea) {
    textarea.addEventListener("input", function () {
      const index = Number(textarea.getAttribute("data-index"));
      contentEditorState.blocks[index].html = textarea.value;
    });
  });

  container.querySelectorAll(".block-delete").forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(button.getAttribute("data-index"));
      contentEditorState.blocks.splice(index, 1);
      renderBlocksEditor();
    });
  });

  container.querySelectorAll(".block-move-up").forEach(function (button) {
    button.addEventListener("click", function () {
      moveBlock(Number(button.getAttribute("data-index")), -1);
    });
  });

  container.querySelectorAll(".block-move-down").forEach(function (button) {
    button.addEventListener("click", function () {
      moveBlock(Number(button.getAttribute("data-index")), 1);
    });
  });
}

function moveBlock(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= contentEditorState.blocks.length) {
    return;
  }

  const blocks = contentEditorState.blocks;
  const temp = blocks[index];
  blocks[index] = blocks[target];
  blocks[target] = temp;
  renderBlocksEditor();
}

function addContentBlock(type) {
  if (type === "heading") {
    contentEditorState.blocks.push({ type: "heading", level: 2, text: "" });
  } else if (type === "paragraph") {
    contentEditorState.blocks.push({ type: "paragraph", text: "" });
  } else if (type === "list" || type === "ordered-list") {
    contentEditorState.blocks.push({ type: type, items: [""] });
  } else if (type === "quote") {
    contentEditorState.blocks.push({ type: "quote", text: "", cite: "" });
  } else if (type === "link") {
    contentEditorState.blocks.push({
      type: "link",
      text: "",
      url: "",
      target: "_blank",
    });
  } else if (type === "image") {
    contentEditorState.blocks.push({
      type: "image",
      src: "",
      alt: "",
      caption: "",
    });
  } else if (type === "divider") {
    contentEditorState.blocks.push({ type: "divider" });
  } else if (type === "html") {
    contentEditorState.blocks.push({ type: "html", html: "" });
  }

  renderBlocksEditor();
}

function renderDownloadsEditor() {
  const container = document.getElementById("contentDownloadsEditor");
  if (!container) {
    return;
  }

  if (!contentEditorState.downloads.length) {
    container.innerHTML =
      '<p class="content-editor_empty">فایل دانلودی ثبت نشده.</p>';
    return;
  }

  container.innerHTML = contentEditorState.downloads
    .map(function (file, index) {
      return (
        '<div class="content-download-row" data-download-index="' +
        index +
        '">' +
        '<input type="text" class="form-control download-title" placeholder="عنوان فایل" value="' +
        escapeAttr(file.title) +
        '">' +
        '<input type="text" class="form-control download-url" placeholder="آدرس فایل" value="' +
        escapeAttr(file.url) +
        '">' +
        '<select class="form-control download-type">' +
        buildDownloadTypeOptions(file.type) +
        "</select>" +
        '<input type="text" class="form-control download-size" placeholder="حجم (اختیاری)" value="' +
        escapeAttr(file.size) +
        '">' +
        '<button type="button" class="btn-secondary download-delete" data-index="' +
        index +
        '">حذف</button>' +
        "</div>"
      );
    })
    .join("");

  container.querySelectorAll(".download-delete").forEach(function (button) {
    button.addEventListener("click", function () {
      contentEditorState.downloads.splice(
        Number(button.getAttribute("data-index")),
        1,
      );
      renderDownloadsEditor();
    });
  });
}

function buildDownloadTypeOptions(selected) {
  const types = ["file", "pdf", "xlsx", "xls", "doc", "docx", "zip"];
  return types
    .map(function (type) {
      return (
        '<option value="' +
        type +
        '"' +
        (selected === type ? " selected" : "") +
        ">" +
        type +
        "</option>"
      );
    })
    .join("");
}

function addDownloadRow() {
  contentEditorState.downloads.push({
    id: "download-" + Date.now(),
    title: "",
    url: "",
    type: "file",
    size: "",
  });
  renderDownloadsEditor();
}

function toggleVideoFields() {
  const enabled = document.getElementById("contentVideoEnabled").checked;
  const fields = document.getElementById("contentVideoFields");
  if (fields) {
    fields.hidden = !enabled;
  }
}

function collectDownloadsFromForm() {
  const rows = document.querySelectorAll(".content-download-row");
  const downloads = [];

  rows.forEach(function (row, index) {
    const title = row.querySelector(".download-title").value.trim();
    const url = row.querySelector(".download-url").value.trim();
    const type = row.querySelector(".download-type").value;
    const size = row.querySelector(".download-size").value.trim();

    if (!title || !url) {
      return;
    }

    downloads.push({
      id: contentEditorState.downloads[index]?.id || "download-" + (index + 1),
      title: title,
      url: url,
      type: type,
      size: size,
    });
  });

  return downloads;
}

function saveEditedContent() {
  if (!contentEditorState.itemId) {
    return;
  }

  const blocks = contentEditorState.blocks
    .map(function (block) {
      return typeof normalizeBlock === "function"
        ? normalizeBlock(block)
        : block;
    })
    .filter(function (block) {
      if (!block) {
        return false;
      }
      if (
        block.type === "heading" ||
        block.type === "paragraph" ||
        block.type === "quote"
      ) {
        return Boolean(block.text);
      }
      if (block.type === "list" || block.type === "ordered-list") {
        return block.items.length > 0;
      }
      if (block.type === "link") {
        return Boolean(block.text && block.url);
      }
      if (block.type === "image") {
        return Boolean(block.src);
      }
      if (block.type === "html") {
        return Boolean(block.html.trim());
      }
      return block.type === "divider";
    });

  const content = { blocks: blocks };
  const excerpt = document.getElementById("editContentExcerpt").value.trim();
  const videoEnabled = document.getElementById("contentVideoEnabled").checked;
  const videoUrl = document.getElementById("contentVideoUrl").value.trim();

  if (videoEnabled && videoUrl) {
    content.video = {
      enabled: true,
      url: videoUrl,
      provider: document.getElementById("contentVideoProvider").value,
      title: document.getElementById("contentVideoTitle").value.trim(),
    };
  }

  const downloads = collectDownloadsFromForm();
  if (downloads.length) {
    content.downloads = downloads;
  }
  const title = document.getElementById("editContentTitleInput")
    ? document.getElementById("editContentTitleInput").value.trim()
    : "";
  const image = document.getElementById("editContentImageInput")
    ? document.getElementById("editContentImageInput").value.trim()
    : "";

  saveContentOverride(contentEditorState.itemId, {
    content: content,
    excerpt: excerpt,
    title: title || undefined,
    image: image || undefined,
  });
  // If this item was a custom added item, make sure we update its base details inside addedItems
  if (typeof loadAddedItems === "function") {
    const addedItems = loadAddedItems();
    const idx = addedItems.findIndex(function (i) {
      return i.id === contentEditorState.itemId;
    });
    if (idx > -1) {
      addedItems[idx].title = title || addedItems[idx].title;
      addedItems[idx].image = image || addedItems[idx].image;
      addedItems[idx].excerpt = excerpt;
      addedItems[idx].content = content;
      localStorage.setItem("irHesabdarAddedItems", JSON.stringify(addedItems));
    }
  }
  if (typeof appApi !== "undefined" && appApi.content) {
    appApi.content
      .update(contentEditorState.itemId, { content: content, excerpt: excerpt })
      .catch(function (error) {
        console.warn("admin-content: همگام‌سازی API انجام نشد", error);
      });
  }

  const found = findSiteItem(contentEditorState.itemId);
  if (found) {
    found.item.content = content;
    found.item.excerpt = excerpt;
    if (title) {
      found.item.title = title;
    }
    if (image) {
      found.item.image = image;
    }
  }

  if (
    typeof applyContentOverrides === "function" &&
    typeof siteData !== "undefined"
  ) {
    applyContentOverrides(siteData);
  }

  // AUTOMATIC REVERSE SYNC: Content to Product
  const hasDownloads = downloads && downloads.length > 0;
  const hasVideo = content.video && content.video.enabled && content.video.url;

  const isPaid = document.getElementById("contentIsPaid") ? document.getElementById("contentIsPaid").checked : false;
  const contentPrice = isPaid ? parseFloat(document.getElementById("contentItemPrice").value || "0") : 0;

  if (hasDownloads || hasVideo) {
    const productsRaw = localStorage.getItem("irHesabdarProducts");
    let products = [];
    if (productsRaw) {
      try {
        products = JSON.parse(productsRaw);
      } catch (e) {}
    }
    if (!Array.isArray(products)) products = [];

    const existingIdx = products.findIndex(function(p) { return String(p.id) === String(contentEditorState.itemId); });
    const finalTitle = title || (found ? found.item.title : "") || (hasDownloads ? downloads[0].title : content.video.title) || "محصول آموزشی";
    const finalImage = image || (found ? found.item.image : "") || "../images/ravin.png";
    
    const finalPrice = contentPrice;

    let updatedProd = null;
    if (hasDownloads) {
      const firstFile = downloads[0];
      updatedProd = {
        id: contentEditorState.itemId,
        name: finalTitle,
        category: firstFile.type || "pdf",
        price: finalPrice,
        fileUrl: firstFile.url,
        fileSize: firstFile.size || "10MB",
        img: finalImage
      };
    } else if (hasVideo) {
      updatedProd = {
        id: contentEditorState.itemId,
        name: finalTitle,
        category: "mp4",
        price: finalPrice,
        fileUrl: content.video.url,
        fileSize: "15MB",
        img: finalImage
      };
    }

    if (updatedProd) {
      if (existingIdx > -1) {
        products[existingIdx] = updatedProd;
      } else {
        products.unshift(updatedProd);
      }

      localStorage.setItem("irHesabdarProducts", JSON.stringify(products));

      if (typeof appState !== "undefined") {
        appState.products = products;
        if (typeof renderProductsTable === "function") {
          renderProductsTable();
        }
        if (typeof renderDashboardProducts === "function") {
          renderDashboardProducts();
        }
      }
    }
  } else {
    // If the content item now has NO downloads and NO video, we automatically DELETE the product!
    const productsRaw = localStorage.getItem("irHesabdarProducts");
    if (productsRaw) {
      try {
        let products = JSON.parse(productsRaw);
        if (Array.isArray(products)) {
          const originalLength = products.length;
          products = products.filter(function(p) { return String(p.id) !== String(contentEditorState.itemId); });
          if (products.length !== originalLength) {
            localStorage.setItem("irHesabdarProducts", JSON.stringify(products));
            if (typeof appState !== "undefined") {
              appState.products = products;
              if (typeof renderProductsTable === "function") {
                renderProductsTable();
              }
              if (typeof renderDashboardProducts === "function") {
                renderDashboardProducts();
              }
            }
          }
        }
      } catch (e) {
        console.warn("admin-content: error syncing product deletion", e);
      }
    }
  }

  closeModal("editContentModal");
  renderContentTable();
  showToast(
    "محتوای «" + contentEditorState.itemId + "» با موفقیت ذخیره شد",
    "success",
  );
}

function resetEditedContent() {
  if (
    !contentEditorState.itemId ||
    typeof removeContentOverride !== "function"
  ) {
    return;
  }

  if (!confirm("محتوای ذخیره‌شده حذف و نسخه پیش‌فرض نمایش داده شود؟")) {
    return;
  }

  removeContentOverride(contentEditorState.itemId);
  if (typeof appApi !== "undefined" && appApi.content) {
    appApi.content.remove(contentEditorState.itemId).catch(function (error) {
      console.warn("admin-content: حذف از API انجام نشد", error);
    });
  }
  window.location.reload();
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bootContentAdmin() {
  if (document.getElementById("view-site-content")) {
    initContentAdmin();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootContentAdmin);
} else {
  bootContentAdmin();
}
