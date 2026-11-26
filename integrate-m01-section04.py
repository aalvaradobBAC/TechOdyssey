from pathlib import Path

path = Path('src/frontend/src/pages/rpg/m01/M01ModulePage.tsx')
text = path.read_text(encoding='utf-8')

import_line = 'import M01Section04 from "./M01Section04";\n'
if import_line not in text:
    marker = 'import content from "./m01-content.json";\n'
    if marker not in text:
        raise SystemExit('No se encontro el import de m01-content.json')
    text = text.replace(marker, marker + import_line, 1)

render_marker = '        <article className="m01Content">\n'
conditional = '''        {section.id === "M01-S04" ? (\n          <article className="m01Content">\n            <M01Section04 onComplete={markComplete} />\n            <footer className="m01Navigation">\n              <button\n                type="button"\n                disabled={currentIndex === 0}\n                onClick={() => goToSection(currentIndex - 1)}\n              >\n                ← Anterior\n              </button>\n              <button\n                type="button"\n                disabled={currentIndex === sections.length - 1}\n                onClick={() => goToSection(currentIndex + 1)}\n              >\n                Siguiente →\n              </button>\n            </footer>\n          </article>\n        ) : (\n'''

if 'section.id === "M01-S04"' not in text:
    if render_marker not in text:
        raise SystemExit('No se encontro el inicio de m01Content')
    text = text.replace(render_marker, conditional + render_marker, 1)

    closing = '''        </article>\n      </div>\n    </main>'''
    replacement = '''        </article>\n        )}\n      </div>\n    </main>'''
    if closing not in text:
        raise SystemExit('No se encontro el cierre del article principal')
    text = text.replace(closing, replacement, 1)

path.write_text(text, encoding='utf-8')
print('Integracion M01-S04 aplicada correctamente.')
