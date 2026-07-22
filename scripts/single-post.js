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

      renderItemContent(post, {
        body: postContent,
        video: postVideo,
        downloads: postDownloads,
      });

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
