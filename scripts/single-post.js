const postTitle = document.getElementById("post-title");
const postImage = document.getElementById("post-image");
const postContent = document.getElementById("post-content");
const postVideo = document.getElementById("post-video");
const postDownloads = document.getElementById("post-downloads");
const backLink = document.getElementById("back-link");

const postId = new URLSearchParams(window.location.search).get("id");

function loadSinglePost() {
  if (!postId) {
    postTitle.textContent = "مطلب پیدا نشد";
    postImage.style.display = "none";
    postContent.innerHTML = "شناسه مطلب در آدرس وجود ندارد.";
    if (postVideo) postVideo.hidden = true;
    if (postDownloads) postDownloads.hidden = true;
    backLink.textContent = "بازگشت به صفحه اصلی";
    backLink.href = "index.html";
    return;
  }

  for (const slug in siteData) {
    const category = siteData[slug];
    const post = category.items.find(function (item) {
      return item.id === postId;
    });

    if (post) {
      document.title = post.title + " | آی آر حسابداران";
      postTitle.textContent = post.title;
      postImage.src = post.image;
      postImage.alt = post.title;

      // CHECK FOR ASSOCIATED DIGITAL PRODUCT
      const productsRaw = localStorage.getItem("irHesabdarProducts");
      let product = null;
      if (productsRaw) {
        try {
          const prods = JSON.parse(productsRaw);
          if (Array.isArray(prods)) {
            product = prods.find(function(p) { return String(p.id) === String(postId); });
          }
        } catch (e) {}
      }

      // CHECK IF ALREADY PURCHASED
      let isPurchased = false;
      try {
        const purchasedRaw = localStorage.getItem("irHesabdarPurchasedProducts");
        const purchased = purchasedRaw ? JSON.parse(purchasedRaw) : [];
        if (Array.isArray(purchased)) {
          isPurchased = purchased.indexOf(postId) !== -1;
        }
      } catch (e) {}

      if (product && !isPurchased) {
        // PAID PRODUCT & NOT YET BOUGHT: Render Locked Content Box
        if (postDownloads) {
          postDownloads.hidden = false;
          postDownloads.innerHTML = `
            <div class="paid-product-box" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 2.5rem; text-align: center; margin-top: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.15); backdrop-filter: blur(10px);">
              <i class="fa-solid fa-lock" style="font-size: 3rem; color: #ff9500; margin-bottom: 1rem;"></i>
              <h3 style="margin-bottom: 0.5rem; color: #fff; font-size: 1.25rem;">این فایل آموزشی نقدی و پولی می‌باشد</h3>
              <p style="color: #86868b; margin-bottom: 1.5rem; font-size: 14px;">برای دسترسی به لینک دانلود اصلی، تماشای ویدیو و استفاده آفلاین، لطفا ابتدا این دوره را خریداری کنید.</p>
              <div style="font-size: 1.75rem; font-weight: bold; color: #34c759; margin-bottom: 1.5rem;">${Number(product.price).toLocaleString()} تومان</div>
              <button id="buyProductBtn" class="btn-primary" style="background: #007aff; padding: 14px 28px; border-radius: 10px; font-weight: bold; border: none; cursor: pointer; font-size: 16px; color: #fff; display: inline-flex; align-items: center; gap: 8px; transition: background 0.3s;">
                <i class="fa-solid fa-credit-card"></i> خرید و دسترسی فوری
              </button>
            </div>
          `;
          
          document.getElementById("buyProductBtn")?.addEventListener("click", function() {
            // Save selected product as a single item in hesabyarCart
            const cartItem = {
              id: product.id,
              name: product.name,
              price: product.price,
              img: product.img || "../images/ravin.png",
              qty: 1
            };
            localStorage.setItem("hesabyarCart", JSON.stringify([cartItem]));
            
            // Navigate to checkout
            window.location.href = "checkout.html";
          });
        }
        if (postVideo) {
          postVideo.hidden = true; // Hide paid video
        }
        
        // Render standard post body description without files/video
        renderItemContent(post, {
          body: postContent,
          video: null,
          downloads: null,
        });
      } else {
        // FREE CONTENT OR ALREADY BOUGHT!
        renderItemContent(post, {
          body: postContent,
          video: postVideo,
          downloads: postDownloads,
        });

        // If it was purchased, prepend a gorgeous success badge!
        if (isPurchased && postDownloads) {
          const badge = document.createElement("div");
          badge.className = "alert alert-success";
          badge.style.background = "rgba(52, 199, 89, 0.08)";
          badge.style.color = "#34c759";
          badge.style.border = "1px solid rgba(52, 199, 89, 0.15)";
          badge.style.padding = "12px";
          badge.style.borderRadius = "8px";
          badge.style.marginBottom = "1.5rem";
          badge.style.textAlign = "center";
          badge.style.fontWeight = "bold";
          badge.style.fontSize = "14px";
          badge.innerHTML = `<i class="fa-solid fa-circle-check" style="margin-left: 6px;"></i> خرید موفقیت‌آمیز بود! قفل فایل با موفقیت باز شد و هم‌اکنون می‌توانید آن را دانلود کنید.`;
          postDownloads.prepend(badge);
        }
      }

      backLink.textContent = "بازگشت به " + category.title;
      backLink.href = "list-page.html?cat=" + slug;
      return;
    }
  }

  postTitle.textContent = "مطلب پیدا نشد";
  postImage.style.display = "none";
  postContent.innerHTML = "مطلب مورد نظر پیدا نشد.";
  if (postVideo) postVideo.hidden = true;
  if (postDownloads) postDownloads.hidden = true;
  backLink.textContent = "بازگشت به صفحه اصلی";
  backLink.href = "index.html";
}

loadSinglePost();
