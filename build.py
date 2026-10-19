"""Genera index.html autocontenido (offline) a partir de src/demo.html, incrustando el logo en base64."""
import base64, pathlib

root = pathlib.Path(__file__).parent
uri = lambda p: "data:image/png;base64," + base64.b64encode((root / p).read_bytes()).decode()
html = (root / "src/demo.html").read_text(encoding="utf-8")
html = html.replace("{{LOGO_WHITE}}", uri("assets/kpmg-logo-white-600.png")).replace("{{LOGO}}", uri("assets/kpmg-logo-600.png"))
(root / "index.html").write_text(html, encoding="utf-8")
print("index.html", len(html) // 1024, "KB")
