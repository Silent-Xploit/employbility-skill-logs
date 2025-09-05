const uploadForm = document.getElementById('uploadForm');
const postsDiv = document.getElementById('posts');
const mainContainer = document.getElementById('mainContainer');
const roleModal = document.getElementById('roleModal');
const lecturerBtn = document.getElementById('lecturerBtn');
const studentBtn = document.getElementById('studentBtn');
const POSTS_KEY = 'employability_posts';
let posts = [];
let role = null;

function loadPosts() {
    const saved = localStorage.getItem(POSTS_KEY);
    if (saved) {
        try {
            posts = JSON.parse(saved);
        } catch (e) {
            posts = [];
        }
    }
}
function savePosts() {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}
loadPosts();

uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (role !== 'student') return;
    const postText = document.getElementById('postText').value;
    const mediaInput = document.getElementById('mediaInput');
    const file = mediaInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        const post = {
            text: postText,
            media: event.target.result,
            mediaType: file.type.startsWith('image') ? 'image' : 'video',
            feedbacks: []
        };
        posts.unshift(post);
        savePosts();
        renderPosts();
        uploadForm.reset();
    };
    reader.readAsDataURL(file);
});

function renderPosts() {
    postsDiv.innerHTML = '';
    posts.forEach((post, idx) => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        let postMedia = post.mediaType === 'image'
            ? `<img src="${post.media}" class="post-media" onclick="viewMedia('${post.media}','image')">`
            : `<video src="${post.media}" class="post-media" controls onclick="viewMedia('${post.media}','video')"></video>`;
        let postActions = '';
        if (role === 'student') {
            postActions += `<button onclick=\"deletePost(${idx})\" style=\"background:#dc3545; color:#fff; border:none; border-radius:4px; padding:6px 12px; cursor:pointer;\">Delete</button>`;
            postActions += `<button onclick=\"editPost(${idx})\" style=\"background:#ffc107; color:#333; border:none; border-radius:4px; padding:6px 12px; cursor:pointer;\">Edit</button>`;
        }
        postActions += `<button onclick="viewMedia('${post.media}','${post.mediaType}')" style="background:#17a2b8; color:#fff; border:none; border-radius:4px; padding:6px 12px; cursor:pointer;">View</button>`;
        let feedbackInput = '';
        let feedbackList = '';
        if (role === 'lecturer') {
            feedbackInput = `<input type="text" placeholder="Leave feedback..." id="feedbackInput${idx}">
                <button onclick="addFeedback(${idx})">Post Feedback</button>`;
            feedbackList = `<div class="feedback-list" id="feedbackList${idx}">
                <strong>Feedback:</strong>
                ${post.feedbacks.map((f, fidx) => `<div>- ${f} <button onclick=\"editFeedback(${idx},${fidx})\" style=\"background:#17a2b8; color:#fff; border:none; border-radius:4px; padding:2px 8px; margin-left:5px; cursor:pointer; font-size:0.9em;\">Edit</button> <button onclick=\"deleteFeedback(${idx},${fidx})\" style=\"background:#ffc107; color:#333; border:none; border-radius:4px; padding:2px 8px; margin-left:5px; cursor:pointer; font-size:0.9em;\">Delete</button></div>`).join('')}
            </div>`;
        } else {
            feedbackList = `<div class="feedback-list" id="feedbackList${idx}">
                <strong>Feedback:</strong>
                ${post.feedbacks.map((f) => `<div>- ${f}</div>`).join('')}
            </div>`;
        }
        postEl.innerHTML = `
            <div>${post.text}</div>
            <div style="display:flex; gap:10px; align-items:center;">
                ${postMedia}
                ${postActions}
            </div>
            <div class="feedback">
                ${feedbackInput}
                ${feedbackList}
            </div>
        `;
        postsDiv.appendChild(postEl);
    });
    uploadForm.style.display = role === 'lecturer' ? 'none' : '';
}

window.addFeedback = function(idx) {
    if (role !== 'lecturer') return;
    const input = document.getElementById('feedbackInput' + idx);
    const feedback = input.value.trim();
    if (feedback) {
        posts[idx].feedbacks.push(feedback);
        savePosts();
        renderPosts();
    }
};
window.deleteFeedback = function(postIdx, feedbackIdx) {
    if (role !== 'lecturer') return;
    posts[postIdx].feedbacks.splice(feedbackIdx, 1);
    savePosts();
    renderPosts();
};
window.editFeedback = function(postIdx, feedbackIdx) {
    if (role !== 'lecturer') return;
    const current = posts[postIdx].feedbacks[feedbackIdx];
    const updated = prompt('Edit feedback:', current);
    if (updated !== null && updated.trim() !== '') {
        posts[postIdx].feedbacks[feedbackIdx] = updated.trim();
        savePosts();
        renderPosts();
    }
};
window.deletePost = function(idx) {
    if (role !== 'student') return;
    if (confirm('Are you sure you want to delete this post?')) {
        posts.splice(idx, 1);
        savePosts();
        renderPosts();
    }
};
window.editPost = function(idx) {
    if (role !== 'student') return;
    // Create a simple popup for edit options
    const choice = prompt('Type "1" to edit description, "2" to edit image/video:', '1');
    if (choice === null) return;
    if (choice === '1') {
        // Edit description
        const newDesc = prompt('Enter new description:', posts[idx].text);
        if (newDesc !== null && newDesc.trim() !== '') {
            posts[idx].text = newDesc.trim();
            savePosts();
            renderPosts();
        }
    } else if (choice === '2') {
        // Edit image/video
        const mediaInput = document.createElement('input');
        mediaInput.type = 'file';
        mediaInput.accept = 'image/*,video/*';
        mediaInput.onchange = function() {
            const file = mediaInput.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(event) {
                posts[idx].media = event.target.result;
                posts[idx].mediaType = file.type.startsWith('image') ? 'image' : 'video';
                savePosts();
                renderPosts();
            };
            reader.readAsDataURL(file);
        };
        mediaInput.click();
    }
};
window.viewMedia = function(mediaSrc, mediaType) {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = mediaType === 'image'
        ? `<img src="${mediaSrc}" style="max-width:100%;max-height:100%;">`
        : `<video src="${mediaSrc}" controls autoplay style="max-width:100%;max-height:100%;"></video>`;
    modal.style.display = 'flex';
};
document.getElementById('closeModal').onclick = function() {
    document.getElementById('modal').style.display = 'none';
};
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
function showMain() {
    roleModal.style.display = 'none';
    mainContainer.style.display = '';
    renderPosts();
}
mainContainer.style.display = 'none';
roleModal.style.display = 'flex';
lecturerBtn.onclick = function() {
    role = 'lecturer';
    showMain();
};
studentBtn.onclick = function() {
    role = 'student';
    showMain();
};
