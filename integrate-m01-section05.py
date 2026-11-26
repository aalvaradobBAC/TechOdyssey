from pathlib import Path

path = Path('src/frontend/src/pages/rpg/m01/M01ModulePage.tsx')
text = path.read_text(encoding='utf-8')

content_import = 'import content from "./m01-content.json";\n'
section05_import = 'import M01Section05 from "./M01Section05";\n'

if section05_import not in text:
    if content_import not in text:
        raise SystemExit('No se encontro el import de m01-content.json')
    text = text.replace(content_import, content_import + section05_import, 1)

old_condition = '''        {section.id === "M01-S04" ? (\n          <article className="m01Content">\n            <M01Section04 onComplete={markComplete} />\n            <footer className="m01Navigation">'''
new_condition = '''        {section.id === "M01-S04" ? (\n          <article className="m01Content">\n            <M01Section04 onComplete={markComplete} />\n            <footer className="m01Navigation">'''

if old_condition not in text:
    raise SystemExit('No se encontro la integracion existente de M01-S04')

# Insert a second ternary branch immediately after the full S04 article branch.
needle = '''          </article>\n        ) : (\n        <article className="m01Content">'''
replacement = '''          </article>\n        ) : section.id === "M01-S05" ? (\n          <article className="m01Content">\n            <M01Section05 onComplete={markComplete} />\n            <footer className="m01Navigation">\n              <button\n                type="button"\n                disabled={currentIndex === 0}\n                onClick={() => goToSection(currentIndex - 1)}\n              >\n                ← Anterior\n              </button>\n              <button\n                type="button"\n                disabled={currentIndex === sections.length - 1}\n                onClick={() => goToSection(currentIndex + 1)}\n              >\n                Siguiente →\n              </button>\n            </footer>\n          </article>\n        ) : (\n        <article className="m01Content">'''

if 'section.id === "M01-S05"' not in text:
    if needle not in text:
        raise SystemExit('No se encontro el punto de insercion despues de M01-S04')
    text = text.replace(needle, replacement, 1)

path.write_text(text, encoding='utf-8')
print('Integracion M01-S05 aplicada correctamente.')
