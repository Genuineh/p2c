let c = !1, a = "flutter", r = !1;
const s = document.getElementById("selectionName"), i = document.getElementById("selectionHint"), o = document.getElementById("generateBtn"), m = document.getElementById("codeOutput"), u = document.getElementById("placeholder"), g = document.getElementById("codeFilename"), l = document.getElementById("codeContent"), n = document.getElementById("copyBtn"), d = document.querySelectorAll(".platform-btn");
function p() {
  d.forEach((e) => {
    e.addEventListener("click", () => {
      e.disabled || (d.forEach((t) => t.classList.remove("active")), e.classList.add("active"), a = e.dataset.platform || "flutter", parent.postMessage(
        {
          pluginMessage: {
            type: "update-config",
            config: { target: a }
          }
        },
        "*"
      ));
    });
  }), o.addEventListener("click", f), n.addEventListener("click", y), parent.postMessage({ pluginMessage: { type: "get-selection" } }, "*");
}
function f() {
  !c || r || parent.postMessage(
    {
      pluginMessage: {
        type: "generate",
        target: a
      }
    },
    "*"
  );
}
async function y() {
  const e = l.textContent || "";
  if (e)
    try {
      await navigator.clipboard.writeText(e), n.textContent = "已复制！", n.classList.add("copied"), setTimeout(() => {
        n.textContent = "复制代码", n.classList.remove("copied");
      }, 2e3);
    } catch {
      const t = document.createElement("textarea");
      t.value = e, document.body.appendChild(t), t.select(), document.execCommand("copy"), document.body.removeChild(t), n.textContent = "已复制！", n.classList.add("copied"), setTimeout(() => {
        n.textContent = "复制代码", n.classList.remove("copied");
      }, 2e3);
    }
}
function C(e) {
  c = e.hasSelection, c ? (s.textContent = e.name || "未命名元素", s.classList.remove("no-selection"), i.textContent = e.count > 1 ? `已选择 ${e.count} 个元素` : "点击生成代码", o.disabled = !1) : (s.textContent = "请选择设计元素", s.classList.add("no-selection"), i.textContent = "", o.disabled = !0);
}
function x(e) {
  r = e, o.disabled = e || !c, e ? (o.classList.add("loading"), o.textContent = "") : (o.classList.remove("loading"), o.textContent = "生成代码");
}
function h(e) {
  if (e.length === 0) return;
  const t = e[0];
  g.textContent = t.filename, l.textContent = t.content, m.style.display = "flex", u.style.display = "none";
}
function E(e) {
  l.textContent = `// 错误: ${e}`, m.style.display = "flex", u.style.display = "none";
}
window.onmessage = (e) => {
  const t = e.data.pluginMessage;
  if (t)
    switch (t.type) {
      case "selection-changed":
        C(t);
        break;
      case "generating":
        x(t.status);
        break;
      case "code-generated":
        h(t.results);
        break;
      case "error":
        E(t.message);
        break;
    }
};
p();
