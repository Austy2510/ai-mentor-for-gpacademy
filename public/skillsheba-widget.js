/*
 * SkillSheba AI Mentor widget loader.
 *
 * Drop this on any page of the host site:
 *   <script src="https://<host>/skillsheba-widget.js" defer></script>
 *
 * It adds a floating chat bubble. Clicking it opens the mentor app
 * (mentor.html) in an iframe, so the host page's CSS and the widget's CSS
 * never collide. The host page's title and main heading are sent to the
 * mentor so it knows which page the student is on.
 */
(function () {
  "use strict";
  if (window.__skillshebaLoaded) return;
  window.__skillshebaLoaded = true;

  var script = document.currentScript;
  var mentorSrc = new URL(
    (script && script.getAttribute("data-mentor-src")) || "mentor.html",
    script ? script.src : location.href
  ).href;
  var mentorOrigin = new URL(mentorSrc).origin;

  var host = document.createElement("div");
  host.id = "skillsheba-widget";
  var root = host.attachShadow({ mode: "open" });

  root.innerHTML =
    "<style>" +
    ":host{all:initial}" +
    ".bubble{position:fixed;right:20px;bottom:20px;z-index:2147483646;width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;" +
    "background:linear-gradient(135deg,#0f9e92,#0a6ebd);color:#fff;box-shadow:0 10px 28px rgba(10,42,107,.35);display:flex;align-items:center;justify-content:center;transition:transform .15s}" +
    ".bubble:hover{transform:scale(1.06)}" +
    ".bubble:focus-visible{outline:3px solid #f2a325;outline-offset:3px}" +
    ".bubble svg{width:28px;height:28px}" +
    ".hint{position:fixed;right:90px;bottom:32px;z-index:2147483646;background:#fff;color:#10233f;font:600 13px/1.35 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
    "padding:10px 14px;border-radius:12px;box-shadow:0 8px 24px rgba(10,42,107,.18);max-width:220px}" +
    ".hint button{all:unset;cursor:pointer;margin-left:6px;color:#5b6b82}" +
    ".panel{position:fixed;right:20px;bottom:92px;z-index:2147483647;width:420px;height:min(680px,calc(100vh - 112px));border-radius:16px;overflow:hidden;" +
    "box-shadow:0 24px 60px rgba(10,20,60,.35);background:#fff;display:none}" +
    ".panel.open{display:block}" +
    ".panel iframe{width:100%;height:100%;border:0;display:block}" +
    "@media (max-width:560px){.panel{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0}.panel.open~.bubble{display:none}.hint{display:none}}" +
    "</style>" +
    '<div class="panel" role="dialog" aria-label="SkillSheba AI Mentor"></div>' +
    '<div class="hint" hidden>Hi! I\'m your AI Mentor. Ask me anything about your career. <button aria-label="Dismiss">✕</button></div>' +
    '<button class="bubble" aria-label="Open SkillSheba AI Mentor" aria-expanded="false">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>' +
    "</button>";

  var panel = root.querySelector(".panel");
  var bubble = root.querySelector(".bubble");
  var hint = root.querySelector(".hint");
  var iframe = null;

  function hostContext() {
    var h1 = document.querySelector("h1");
    return {
      type: "skillsheba:context",
      title: document.title,
      path: location.pathname,
      heading: h1 ? (h1.innerText || h1.textContent || "").replace(/\s+/g, " ").trim() : "",
    };
  }

  function sendContext() {
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(hostContext(), mentorOrigin);
    }
  }

  function setOpen(open) {
    if (open && !iframe) {
      iframe = document.createElement("iframe");
      iframe.title = "SkillSheba AI Mentor";
      iframe.src = mentorSrc;
      iframe.allow = "clipboard-write";
      iframe.addEventListener("load", sendContext);
      panel.appendChild(iframe);
    }
    panel.classList.toggle("open", open);
    bubble.setAttribute("aria-expanded", String(open));
    bubble.setAttribute("aria-label", open ? "Close SkillSheba AI Mentor" : "Open SkillSheba AI Mentor");
    if (open) {
      hint.hidden = true;
      sendContext();
    }
  }

  bubble.addEventListener("click", function () {
    setOpen(!panel.classList.contains("open"));
  });
  hint.querySelector("button").addEventListener("click", function () {
    hint.hidden = true;
  });

  window.addEventListener("message", function (e) {
    if (e.origin !== mentorOrigin || !e.data) return;
    if (e.data.type === "skillsheba:close") setOpen(false);
    if (e.data.type === "skillsheba:ready") sendContext();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) setOpen(false);
  });

  function mount() {
    document.body.appendChild(host);
    setTimeout(function () {
      if (!panel.classList.contains("open")) hint.hidden = false;
    }, 1500);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
