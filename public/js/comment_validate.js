import * as helpers from "./validate.js";

document.addEventListener("DOMContentLoaded", () => {
  const commentForm = document.getElementById("text")?.form;
  if (!commentForm) return;

  commentForm.addEventListener("submit", (event) => {
    try {
      let commentText = document.getElementById("text").value;
      // input exits?
      helpers.inputExist(commentText, "comment");
      // string ?
      helpers.inputString(commentText, "comment");
      // trim
      commentText = commentText.trim();
      // empty string?
      helpers.inputEmptyString(commentText, "comment");
      // 255 max characters
      if (commentText.length > 255)
        throw "Comment cannot exceed 255 characters";
    } catch (e) {
      event.preventDefault();
      let errorContainer = document.getElementById("comment-error");
      if (errorContainer) {
        errorContainer.textContent = e;
      } else {
        alert(e);
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reply-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      let commentId = btn.getAttribute("data-comment-id");
      const parentInput = document.getElementById("parentCommentId");
      const textarea = document.getElementById("text");
      try{
        helpers.inputExist(commentId, "parentCommentId");
        helpers.inputString(commentId, "parentCommentId");
        commentId = commentId.trim()
        helpers.inputEmptyString(commentId, "parentCommentId");

        if(parentInput && textarea){
          parentInput.value = commentId;
          textarea.focus()
        }

      } catch (e) {
      let errorContainer = document.getElementById("comment-error");
      if (errorContainer) {
        errorContainer.textContent = e;
      } else {
        alert(e);
      }
    }
    });
  });
});
